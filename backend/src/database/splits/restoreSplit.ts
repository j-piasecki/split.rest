import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { splitExists } from '../utils/splitExists'
import { Pool } from 'pg'
import { RestoreSplitArguments } from 'shared'

export async function restoreSplit(pool: Pool, callerId: string, args: RestoreSplitArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await hasAccessToGroup(client, args.groupId, callerId))) {
      throw new ForbiddenException('api.insufficientPermissions.group.access')
    }

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    const splitInfo = (
      await client.query<{ paid_by: string; created_by: string; total: string }>(
        'SELECT paid_by, created_by, total FROM splits WHERE group_id = $1 AND id = $2',
        [args.groupId, args.splitId]
      )
    ).rows[0]

    if (
      splitInfo.created_by !== callerId &&
      splitInfo.paid_by !== callerId &&
      !(await isUserGroupAdmin(client, args.groupId, callerId))
    ) {
      throw new ForbiddenException('api.insufficientPermissions.group.restoreSplit')
    }

    const splitParticipants = (
      await client.query('SELECT user_id, change FROM split_participants WHERE split_id = $1', [
        args.splitId,
      ])
    ).rows

    for (const participant of splitParticipants) {
      await client.query(
        'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
        [participant.change, args.groupId, participant.user_id]
      )
    }

    await client.query('UPDATE groups SET total = total + $1 WHERE id = $2', [
      splitInfo.total,
      args.groupId,
    ])

    await client.query('UPDATE splits SET deleted = FALSE WHERE group_id = $1 AND id = $2', [
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
