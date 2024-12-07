import { Client, Pool, PoolClient } from 'pg'

export async function isGroupDeleted(client: Pool | PoolClient | Client, groupId: number) {
  const result = await client.query('SELECT deleted FROM groups WHERE id = $1', [groupId])
  return result.rows[0].deleted
}
