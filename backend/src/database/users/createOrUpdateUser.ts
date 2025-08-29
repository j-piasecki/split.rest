import { Pool } from 'pg'
import { CreateOrUpdateUserArguments } from 'shared'
import { BadRequestException } from 'src/errors/BadRequestException'
import { ImageService } from 'src/image.service'

export async function createOrUpdateUser(
  pool: Pool,
  user: CreateOrUpdateUserArguments,
  imageService: ImageService
): Promise<boolean> {
  if (!user.name || !user.email) {
    throw new BadRequestException('api.invalidArguments')
  }

  const name = user.name.length > 128 ? user.name.slice(0, 128) : user.name
  // TODO: remove this from the database?
  const photoUrl =
    user.photoUrl && user.photoUrl.length > 512
      ? user.photoUrl.slice(0, 512)
      : (user.photoUrl ?? null)

  let previousEmail: string | null = null
  let pictureId: string | null = null

  try {
    const result = await pool.query(
      `SELECT email, photo_url, picture_id FROM users WHERE id = $1`,
      [user.id]
    )

    if (result.rows.length > 0) {
      previousEmail = result.rows[0].email
      pictureId = result.rows[0].picture_id
    }
  } catch {}

  if (previousEmail === null && (user.email.length < 3 || !user.email.includes('@'))) {
    throw new BadRequestException('api.invalidArguments')
  }

  if (pictureId === null && user.photoUrl) {
    pictureId = crypto.randomUUID()

    try {
      await imageService.downloadProfilePicture(user.photoUrl, pictureId)
      await imageService.uploadProfilePictureToR2(pictureId)
    } catch (error) {
      console.error(`Failed to download profile picture for ${user.id}`, error)
    }
  }

  try {
    await pool.query(
      `
        INSERT INTO users(id, name, email, created_at, photo_url, picture_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET photo_url = $5, deleted = FALSE, picture_id = $6
      `,
      [user.id, name, user.email, Date.now(), photoUrl, pictureId]
    )
  } catch (error) {
    console.error(`Failed to create or update user ${user.id} (${user.name}, ${user.email})`, error)
    throw error
  }

  return previousEmail != null
}
