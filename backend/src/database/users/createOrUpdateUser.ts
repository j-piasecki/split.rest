import { Pool } from 'pg'
import { User } from 'shared'
import { BadRequestException } from 'src/errors/BadRequestException'

export interface CreateOrUpdateUserResult {
  emailUpdated: boolean
  photoUrlUpdated: boolean
}

export async function createOrUpdateUser(
  pool: Pool,
  user: User
): Promise<CreateOrUpdateUserResult> {
  if (!user.name || !user.email) {
    throw new BadRequestException('api.invalidArguments')
  }

  const name = user.name.length > 128 ? user.name.slice(0, 128) : user.name
  const photoUrl =
    user.photoUrl && user.photoUrl.length > 512
      ? user.photoUrl.slice(0, 512)
      : (user.photoUrl ?? null)

  let previousEmail: string | null = null
  let previousPhotoUrl: string | null = null

  try {
    const result = await pool.query(`SELECT email, photo_url FROM users WHERE id = $1`, [user.id])
    previousEmail = result.rows[0].email
    previousPhotoUrl = result.rows[0].photo_url
  } catch {}

  await pool.query(
    `
      INSERT INTO users(id, name, email, created_at, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = $3, photo_url = $5
    `,
    [user.id, name, user.email, Date.now(), photoUrl]
  )

  return {
    emailUpdated: previousEmail === null || previousEmail !== user.email,
    photoUrlUpdated: previousPhotoUrl === null || previousPhotoUrl !== photoUrl,
  }
}
