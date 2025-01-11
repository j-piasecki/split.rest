import { Pool } from 'pg'

export async function deleteUser(pool: Pool, userId: string) {
  await pool.query(
    `
      UPDATE users
      SET email = NULL, photo_url = NULL, deleted = true
      WHERE id = $1
    `,
    [userId]
  )
}
