import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { GetUserByEmailArguments, User } from 'shared'

export async function getUserByEmail(
  pool: Pool,
  _callerId: string,
  args: GetUserByEmailArguments
): Promise<User> {
  const rows = (
    await pool.query('SELECT id, name, email, deleted FROM users WHERE email = $1', [args.email])
  ).rows

  if (rows.length === 0) {
    throw new NotFoundException('api.notFound.user')
  }

  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    deleted: rows[0].deleted,
  }
}
