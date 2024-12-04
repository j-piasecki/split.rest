import { isUserGroupAdmin } from './utils/isUserGroupAdmin'
import { userExists } from './utils/userExists'
import { Pool } from 'pg'
import { SetGroupAdminArguments } from 'shared'

export async function setGroupAdmin(pool: Pool, callerId: string, args: SetGroupAdminArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new Error('You do not have permission to set group admin')
    }

    if (!(await userExists(client, args.userId))) {
      throw new Error('User not found')
    }

    await client.query(
      'UPDATE group_members SET is_admin = $1 WHERE group_id = $2 AND user_id = $3',
      [args.admin, args.groupId, args.userId]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
