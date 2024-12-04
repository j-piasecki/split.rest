import { Client, Pool, PoolClient } from 'pg'

export async function isUserGroupAdmin(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
) {
  const { rows } = await client.query(
    'SELECT is_admin FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  )
  return rows[0]?.is_admin
}
