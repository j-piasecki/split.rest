import { Pool } from 'pg'
import { DeleteSplitArguments } from 'shared'

export async function deleteSplit(pool: Pool, callerId: string, args: DeleteSplitArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const hasAccess = (
      await client.query(
        'SELECT has_access FROM group_members WHERE group_id = $1 AND user_id = $2',
        [args.groupId, callerId]
      )
    ).rows[0]?.has_access

    if (!hasAccess) {
      throw new Error('You do not have permission to delete splits in this group')
    }

    const splitExists = (
      await client.query('SELECT 1 FROM splits WHERE group_id = $1 AND id = $2', [
        args.groupId,
        args.splitId,
      ])
    ).rowCount

    if (!splitExists) {
      throw new Error('Split not found in group')
    }

    const splitParticipants = (
      await client.query('SELECT user_id, change FROM split_participants WHERE split_id = $1', [
        args.splitId,
      ])
    ).rows

    for (const participant of splitParticipants) {
      await client.query(
        'UPDATE group_members SET balance = balance - $1 WHERE group_id = $2 AND user_id = $3',
        [participant.change, args.groupId, participant.user_id]
      )
    }

    await client.query('UPDATE splits SET deleted = TRUE WHERE group_id = $1 AND id = $2', [
      args.groupId,
      args.splitId,
    ])

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
