import { isUserGroupOwner } from './isUserGroupOwner'
import { Client, Pool, PoolClient } from 'pg'

export async function isUserGroupAdmin(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
): Promise<boolean> {
  const { rows } = await client.query<{ is_admin: boolean }>(
    'SELECT is_admin FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  )

  if (rows[0].is_admin) {
    return true
  }

  if (await isUserGroupOwner(client, groupId, userId)) {
    return true
  }

  return false
}
