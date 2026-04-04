import { Logger } from '@nestjs/common'
import crypto from 'crypto'
import { Pool } from 'pg'
import { ImageService } from 'src/image.service'

const logger = new Logger('SetProfilePicture')

export async function setProfilePicture(
  pool: Pool,
  imageService: ImageService,
  callerId: string,
  buffer: Buffer
) {
  const client = await pool.connect()
  let newPictureId = crypto.randomUUID()

  try {
    await client.query('BEGIN')

    // Make sure the new picture id is unique (extremely unlikely that it won't be)
    while ((await client.query('SELECT 1 FROM users WHERE picture_id = $1', [newPictureId])).rowCount) {
      newPictureId = crypto.randomUUID()
    }

    await imageService.saveImageToFile(buffer, `public/${newPictureId}.jpg`)
    if (process.env.DEV !== '1') {
      await imageService.uploadProfilePictureToR2(newPictureId)
    }

    const oldPictureId = await client
      .query<{
        picture_id: string | null
      }>(
        'WITH old AS (SELECT picture_id FROM users WHERE id = $1) UPDATE users SET picture_id = $2 FROM old WHERE id = $1 RETURNING old.picture_id',
        [callerId, newPictureId]
      )
      .then((r) => r.rows[0].picture_id)

    await client.query('COMMIT')

    if (oldPictureId) {
      imageService.deleteProfilePicture(oldPictureId).catch((err) => {
        logger.warn({ msg: 'Failed to delete old profile picture', oldPictureId, error: err.message })
      })
      if (process.env.DEV !== '1') {
        imageService.deleteProfilePictureFromR2(oldPictureId).catch((err) => {
          logger.warn({ msg: 'Failed to delete old profile picture from R2', oldPictureId, error: err.message })
        })
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
