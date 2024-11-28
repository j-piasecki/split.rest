import { Pool } from 'pg'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(pool: Pool, callerId: string, args: AddUserToGroupArguments) {
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
      throw new Error('You do not have permission to add users to this group')
    }

    const userExists = (await client.query('SELECT 1 FROM users WHERE id = $1', [args.userId]))
      .rowCount

    if (!userExists) {
      throw new Error('User not found')
    }

    const userAlreadyAMember = (
      await client.query('SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2', [
        args.groupId,
        args.userId,
      ])
    ).rowCount

    if (userAlreadyAMember) {
      throw new Error('User is already a member of the group')
    }

    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [
      args.groupId,
      args.userId,
    ])

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
