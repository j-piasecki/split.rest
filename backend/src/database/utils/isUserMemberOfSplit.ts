import { Client, Pool, PoolClient } from 'pg'

export async function isUserMemberOfSplit(
  client: Pool | PoolClient | Client,
  splitId: number,
  userId: string
) {
  const result = await client.query(
    'SELECT 1 FROM splits INNER JOIN split_participants ON splits.id = split_participants.split_id WHERE splits.id = $1 AND user_id = $2',
    [splitId, userId]
  )

  if (result.rowCount && result.rowCount > 0) {
    return true
  }

  const createdBy = await client.query('SELECT 1 FROM splits WHERE id = $1 AND created_by = $2', [
    splitId,
    userId,
  ])

  return (createdBy.rowCount ?? 0) > 0
}
