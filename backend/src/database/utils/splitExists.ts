import { Client, Pool, PoolClient } from 'pg'

export async function splitExists(
  client: Pool | PoolClient | Client,
  groupId: number,
  splitId: number
): Promise<boolean> {
  return (
    (await client.query('SELECT 1 FROM splits WHERE group_id = $1 AND id = $2', [groupId, splitId]))
      .rowCount > 0
  )
}
