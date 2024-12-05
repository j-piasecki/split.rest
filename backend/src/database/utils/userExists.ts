import { Client, Pool, PoolClient } from 'pg'

export async function userExists(
  client: Pool | PoolClient | Client,
  userId: string
): Promise<boolean> {
  return (await client.query('SELECT 1 FROM users WHERE id = $1', [userId])).rowCount > 0
}
