import { Client, Pool, PoolClient } from 'pg'

export async function canQuickRestoreSplit(
  client: Pool | PoolClient | Client,
  splitId: number,
  userId: string
) {
  const data = await client.query(
    'SELECT deleted_at FROM splits WHERE deleted = true AND id = $1 AND deleted_by = $2',
    [splitId, userId]
  )

  if (data.rowCount && data.rowCount > 0) {
    const deletedAt = Number(data.rows[0].deleted_at)

    // Check if the split was deleted less than 5 minutes ago
    return Date.now() - deletedAt < 1000 * 60 * 5
  }

  return false
}
