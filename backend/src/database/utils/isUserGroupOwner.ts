import { Client, Pool, PoolClient } from 'pg'

export async function isUserGroupOwner(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
): Promise<boolean> {
  const { rows } = await client.query<{ owner: string }>('SELECT owner FROM groups WHERE id = $1', [
    groupId,
  ])

  return rows[0].owner === userId
}
