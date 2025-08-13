import { BadRequestException } from '../../errors/BadRequestException'
import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupOwner } from '../utils/isUserGroupOwner'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { Pool, PoolClient } from 'pg'
import { AndroidNotificationChannel, RemoveMemberFromGroupArguments } from 'shared'
import NotificationUtils from 'src/notifications/NotificationUtils'

async function dispatchNotification(client: PoolClient, args: RemoveMemberFromGroupArguments) {
  const groupInfo = (await client.query('SELECT name FROM groups WHERE id = $1', [args.groupId]))
    .rows[0]
  const tokens = await getNotificationTokens(client, args.userId)
  tokens.forEach((token) => {
    NotificationUtils.sendNotification({
      token: token,
      title: groupInfo.name,
      body: {
        key: 'notification.groupRemoveMember.message',
      },
      androidChannel: AndroidNotificationChannel.GroupInvites,
    })
  })
}

export async function removeMember(
  pool: Pool,
  callerId: string,
  args: RemoveMemberFromGroupArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await isUserMemberOfGroup(client, args.groupId, args.userId))) {
      throw new BadRequestException('api.group.userNotInGroup')
    }

    if (await isUserGroupOwner(client, args.groupId, args.userId)) {
      throw new ForbiddenException('api.insufficientPermissions.group.manageOwner')
    }

    // check if there are any splits in which the user is a participant
    const splits = await client.query(
      `
        SELECT id
        FROM splits
        INNER JOIN split_participants ON splits.id = split_participants.split_id
        WHERE deleted = FALSE AND group_id = $1 AND split_participants.user_id = $2
        LIMIT 1
      `,
      [args.groupId, args.userId]
    )

    if (splits.rowCount && splits.rowCount > 0) {
      throw new BadRequestException('api.group.userIsSplitParticipant')
    }

    // remove the user from the group
    await client.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [
      args.groupId,
      args.userId,
    ])

    await client.query(
      'UPDATE groups SET member_count = member_count - 1, last_update = $1 WHERE id = $2',
      [Date.now(), args.groupId]
    )

    await client.query('COMMIT')

    await dispatchNotification(client, args)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
