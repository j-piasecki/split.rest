import { Client, Pool, PoolClient } from 'pg'

export async function canUserCompleteSplitEntry(
  client: Pool | PoolClient | Client,
  splitId: number,
  userId: string,
  callerId: string
) {
  const targetEntry = await client.query(
    'SELECT 1 FROM split_participants WHERE split_id = $1 AND user_id = $2 AND pending = true',
    [splitId, userId]
  )
  const targetEntryExists = Boolean(targetEntry.rowCount)

  const paidByUser = await client.query('SELECT 1 FROM splits WHERE id = $1 AND paid_by = $2', [
    splitId,
    callerId,
  ])

  if (paidByUser.rowCount) {
    return targetEntryExists
  }

  if (userId === callerId) {
    return targetEntryExists
  }

  return false
}

export async function canUserUncompleteSplitEntry(
  client: Pool | PoolClient | Client,
  splitId: number,
  userId: string,
  callerId: string
) {
  const targetEntry = await client.query(
    'SELECT 1 FROM split_participants WHERE split_id = $1 AND user_id = $2 AND pending = false',
    [splitId, userId]
  )
  const targetEntryExists = Boolean(targetEntry.rowCount)

  const paidByUser = await client.query('SELECT 1 FROM splits WHERE id = $1 AND paid_by = $2', [
    splitId,
    callerId,
  ])

  if (paidByUser.rowCount) {
    return targetEntryExists
  }

  if (userId === callerId) {
    return targetEntryExists
  }

  return false
}
