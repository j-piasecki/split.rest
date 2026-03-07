import { Client, Pool, PoolClient } from 'pg'

export async function isUserGhost(
  client: Pool | PoolClient | Client,
  userId: string
): Promise<boolean> {
  const { rows } = await client.query<{ is_ghost: boolean }>(
    'SELECT is_ghost FROM users WHERE id = $1',
    [userId]
  )

  return rows[0]?.is_ghost ?? false
}
