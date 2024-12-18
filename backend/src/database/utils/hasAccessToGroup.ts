import { Client, Pool, PoolClient } from 'pg'

export async function hasAccessToGroup(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
): Promise<boolean> {
  const { rows } = await client.query<{ has_access: boolean }>(
    'SELECT has_access FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  )

  return rows[0].has_access ?? false
}
