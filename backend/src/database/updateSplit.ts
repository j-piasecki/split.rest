import { Pool } from 'pg'
import { UpdateSplitArguments } from 'shared'

export async function updateSplit(pool: Pool, callerId: string, args: UpdateSplitArguments) {
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
      throw new Error('You do not have permission to update splits in this group')
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

    for (const balance of args.balances) {
      const userExists = (
        await client.query('SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2', [
          args.groupId,
          balance.id,
        ])
      ).rowCount

      if (!userExists) {
        throw new Error('User not found in group')
      }

      await client.query(
        'INSERT INTO split_participants (split_id, user_id, change) VALUES ($1, $2, $3) ON CONFLICT (split_id, user_id) DO UPDATE SET change = $3',
        [args.splitId, balance.id, balance.change]
      )

      await client.query(
        'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
        [balance.change, args.groupId, balance.id]
      )
    }

    await client.query(
      'UPDATE splits SET name = $3, total = $4, paid_by = $5, timestamp = $6, updated_at = $7 WHERE group_id = $1 AND id = $2',
      [args.groupId, args.splitId, args.title, args.total, args.paidBy, args.timestamp, Date.now()]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
