import { Pool } from 'pg'
import { User } from 'shared'

export async function createOrUpdateUser(pool: Pool, user: User) {
  const name = user.name.length > 128 ? user.name.slice(0, 128) : user.name
  const photoURL = user.photoURL.length > 512 ? user.photoURL.slice(0, 512) : user.photoURL

  await pool.query(
    `
      INSERT INTO users(id, name, email, created_at, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = $3, photo_url = $5
    `,
    [user.id, name, user.email, Date.now(), photoURL]
  )
}
