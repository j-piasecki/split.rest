import crypto from 'crypto'
import { Pool } from 'pg'
import { ImageService } from 'src/image.service'

export async function setProfilePicture(
  pool: Pool,
  imageService: ImageService,
  callerId: string,
  buffer: Buffer
) {
  const client = await pool.connect()
  const newPictureId = crypto.randomUUID()

  try {
    await client.query('BEGIN')

    if (process.env.DEV === '1') {
      await imageService.saveImageToFile(buffer, `public/${newPictureId}.jpg`)
    } else {
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
      // fail silently when profile picture deletion fails
      if (process.env.DEV === '1') {
        imageService.deleteProfilePicture(oldPictureId).catch(() => {})
      } else {
        imageService.deleteProfilePictureFromR2(oldPictureId).catch(() => {})
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
