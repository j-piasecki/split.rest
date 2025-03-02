import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { Pool, PoolClient } from 'pg'
import { AndroidNotificationChannel, InviteUserToGroupArguments } from 'shared'
import NotificationUtils from 'src/notifications/NotificationUtils'

async function dispatchNotification(client: PoolClient, args: InviteUserToGroupArguments) {
  const groupInfo = (await client.query('SELECT name FROM groups WHERE id = $1', [args.groupId]))
    .rows[0]

  const tokens = await getNotificationTokens(client, args.userId)

  tokens.forEach((token) => {
    NotificationUtils.sendNotification({
      token: token,
      title: groupInfo.name,
      body: {
        key: 'notification.groupInvite.message',
      },
      data: {
        pathToOpen: `/groupInvites/`,
      },
      androidChannel: AndroidNotificationChannel.GroupInvites,
    })
  })
}

export async function inviteUser(pool: Pool, callerId: string, args: InviteUserToGroupArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('api.notFound.user')
    }

    if (await isUserMemberOfGroup(client, args.groupId, args.userId)) {
      throw new ConflictException('api.group.userAlreadyInGroup')
    }

    const latestInvite = (
      await client.query(
        `
        SELECT created_at
        FROM group_invites
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
        [args.userId]
      )
    ).rows[0]

    const inviteState = await client.query(
      `
        SELECT rejected, withdrawn
        FROM group_invites
        WHERE group_id = $1 AND user_id = $2
      `,
      [args.groupId, args.userId]
    )

    if (inviteState?.rowCount && !inviteState.rows[0].rejected && !inviteState.rows[0].withdrawn) {
      throw new ConflictException('api.group.userAlreadyInvited')
    }

    await client.query(
      `
        INSERT INTO group_invites (group_id, user_id, created_by, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (group_id, user_id) DO UPDATE SET created_by = $3, created_at = $4, rejected = FALSE, withdrawn = FALSE
      `,
      [args.groupId, args.userId, callerId, Date.now()]
    )

    await client.query('COMMIT')

    // send max notification per hour
    if (!latestInvite || Date.now() - latestInvite.created_at > 1000 * 60 * 60) {
      await dispatchNotification(client, args)
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
