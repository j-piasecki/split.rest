import { hasAccessToGroup } from './utils/hasAccessToGroup'
import { isUserGroupAdmin } from './utils/isUserGroupAdmin'
import { splitExists } from './utils/splitExists'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { DeleteSplitArguments } from 'shared'

export async function deleteSplit(pool: Pool, callerId: string, args: DeleteSplitArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await hasAccessToGroup(client, args.groupId, callerId))) {
      throw new UnauthorizedException('You do not have permission to delete splits in this group')
    }

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('Split not found in group')
    }

    const splitInfo = (
      await client.query('SELECT paid_by, created_by FROM splits WHERE group_id = $1 AND id = $2', [
        args.groupId,
        args.splitId,
      ])
    ).rows[0]

    if (
      splitInfo.created_by !== callerId &&
      splitInfo.paid_by !== callerId &&
      !(await isUserGroupAdmin(client, args.groupId, callerId))
    ) {
      throw new UnauthorizedException('You do not have permission to delete this split')
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
