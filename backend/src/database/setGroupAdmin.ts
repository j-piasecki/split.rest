import { Pool } from 'pg'
import { SetGroupAdminArguments } from 'shared'

export async function setGroupAdmin(pool: Pool, callerId: string, args: SetGroupAdminArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const isCallerAdmin = (
      await client.query(
        'SELECT is_admin FROM group_members WHERE group_id = $1 AND user_id = $2',
        [args.groupId, callerId]
      )
    ).rows[0]?.is_admin

    if (!isCallerAdmin) {
      throw new Error('You do not have permission to set group admin')
    }

    const userExists = (await client.query('SELECT 1 FROM users WHERE id = $1', [args.userId]))
      .rowCount

    if (!userExists) {
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
