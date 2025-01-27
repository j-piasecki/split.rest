import { Client, Pool, PoolClient } from 'pg'

export async function isUserMemberOfSplit(
  client: Pool | PoolClient | Client,
  splitId: number,
  userId: string
) {
  // Check if the user is a participant of the split
  const isParticipating = await client.query(
    'SELECT 1 FROM splits INNER JOIN split_participants ON splits.id = split_participants.split_id WHERE splits.id = $1 AND user_id = $2',
    [splitId, userId]
  )

  if (isParticipating.rowCount && isParticipating.rowCount > 0) {
    return true
  }

  // Check if the user created or paid for the split
  const createdOrPaidBy = await client.query(
    'SELECT 1 FROM splits WHERE id = $1 AND (created_by = $2 OR paid_by = $2)',
    [splitId, userId]
  )

  if (createdOrPaidBy.rowCount && createdOrPaidBy.rowCount > 0) {
    return true
  }

  // Check if the user is a participant of the previous split versions
  const wasParticipating = await client.query(
    `
      SELECT 1 
      FROM split_edits INNER JOIN split_participants_edits 
      ON split_edits.id = split_participants_edits.split_id 
      WHERE split_edits.id = $1 AND split_participants_edits.user_id = $2
    `,
    [splitId, userId]
  )

  if (wasParticipating.rowCount && wasParticipating.rowCount > 0) {
    return true
  }

  // Check if the user created or paid for the previous version of the split
  const wasCreatedOrPaidBy = await client.query(
    'SELECT 1 FROM split_edits WHERE id = $1 AND (created_by = $2 OR paid_by = $2)',
    [splitId, userId]
  )

  if (wasCreatedOrPaidBy.rowCount && wasCreatedOrPaidBy.rowCount > 0) {
    return true
  }

  return false
}
