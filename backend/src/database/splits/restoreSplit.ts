import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isGroupLocked } from '../utils/isGroupLocked'
import { splitExists } from '../utils/splitExists'
import { unsafeUpdateMonthlyStats } from '../utils/unsafeUpdateMonthlyStats'
import { Pool } from 'pg'
import { RestoreSplitArguments, isSettleUpSplit } from 'shared'

export async function restoreSplit(pool: Pool, callerId: string, args: RestoreSplitArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await splitExists(client, args.groupId, args.splitId, true))) {
      throw new NotFoundException('api.notFound.split')
    }

    if (await isGroupLocked(client, args.groupId)) {
      throw new ForbiddenException('api.group.locked')
    }

    const splitInfo = (
      await client.query<{
        paid_by: string
        created_by: string
        total: string
        type: number
        timestamp: string
      }>(
        'SELECT paid_by, created_by, total, type, timestamp FROM splits WHERE group_id = $1 AND id = $2',
        [args.groupId, args.splitId]
      )
    ).rows[0]

    // get all participants of the split being restored
    const splitParticipants = (
      await client.query(
        'SELECT user_id, change FROM split_participants WHERE split_id = $1 AND pending = false',
        [args.splitId]
      )
    ).rows

    // make sure all participants are members of the group
    const participantIds = splitParticipants.map((p) => p.user_id)
    const participantsWhoAreMembers = (
      await client.query(
        'SELECT user_id FROM group_members WHERE group_id = $1 AND user_id = ANY($2)',
        [args.groupId, participantIds]
      )
    ).rows.map((p) => p.user_id)

    const participantsWhoAreNotMembers = participantIds.filter(
      (id) => !participantsWhoAreMembers.includes(id)
    )

    if (participantsWhoAreNotMembers.length > 0) {
      throw new ForbiddenException('api.split.notAllParticipantsAreMembers')
    }

    // add back the balances of the participants
    for (const participant of splitParticipants) {
      await client.query(
        'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
        [participant.change, args.groupId, participant.user_id]
      )
    }

    // update the group info
    await client.query('UPDATE groups SET total = total + $1, last_update = $2 WHERE id = $3', [
      isSettleUpSplit(splitInfo.type) ? 0 : splitInfo.total,
      Date.now(),
      args.groupId,
    ])

    if (!isSettleUpSplit(splitInfo.type)) {
      await unsafeUpdateMonthlyStats(client, args.groupId, {
        type: 'createSplit',
        total: splitInfo.total,
        timestamp: Number(splitInfo.timestamp),
      })
    }

    await client.query(
      'UPDATE splits SET deleted = FALSE, deleted_by = NULL, deleted_at = NULL WHERE group_id = $1 AND id = $2',
      [args.groupId, args.splitId]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
