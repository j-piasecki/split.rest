import { Pool } from 'pg'
import { CreateOrUpdateUserArguments } from 'shared'
import { BadRequestException } from 'src/errors/BadRequestException'

export async function createOrUpdateUser(
  pool: Pool,
  user: CreateOrUpdateUserArguments
): Promise<boolean> {
  if (!user.name || !user.email) {
    throw new BadRequestException('api.invalidArguments')
  }

  const name = user.name.length > 128 ? user.name.slice(0, 128) : user.name
  const photoUrl =
    user.photoUrl && user.photoUrl.length > 512
      ? user.photoUrl.slice(0, 512)
      : (user.photoUrl ?? null)

  let previousEmail: string | null = null

  try {
    const result = await pool.query(`SELECT email, photo_url FROM users WHERE id = $1`, [user.id])
    previousEmail = result.rows[0].email
  } catch {}

  if (previousEmail === null && (user.email.length < 3 || !user.email.includes('@'))) {
    throw new BadRequestException('api.invalidArguments')
  }

  try {
    await pool.query(
      `
        INSERT INTO users(id, name, email, created_at, photo_url, picture_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET photo_url = $5, deleted = FALSE, picture_id = $6
      `,
      // TODO: Use a random id for the picture_id
      [user.id, name, user.email, Date.now(), photoUrl, user.id]
    )
  } catch (error) {
    console.error(`Failed to create or update user ${user.id} (${user.name}, ${user.email})`, error)
    throw error
  }

  return previousEmail != null
}
