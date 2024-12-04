import { Client, Pool, PoolClient } from 'pg'

export async function isUserMemberOfGroup(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
) {
  const result = await client.query(
    'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  )
  return result.rowCount > 0
}
