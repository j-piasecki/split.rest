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

    await imageService.saveImageToFile(buffer, `public/${newPictureId}.jpg`)
    await imageService.uploadProfilePictureToR2(newPictureId)

    await client.query('UPDATE users SET picture_id = $1 WHERE id = $2', [newPictureId, callerId])

    await client.query('COMMIT')
    // TODO: delete old picture
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}
