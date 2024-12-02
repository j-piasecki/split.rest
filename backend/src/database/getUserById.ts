import { NotFoundException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetUserByIdArguments, User } from 'shared'

export async function getUserById(
  pool: Pool,
  _callerId: string,
  args: GetUserByIdArguments
): Promise<User> {
  const rows = (
    await pool.query('SELECT id, name, email, photo_url FROM users WHERE id = $1', [args.userId])
  ).rows

  if (rows.length === 0) {
    throw new NotFoundException()
  }

  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    photoURL: rows[0].photo_url,
  }
}
