import { NotFoundException } from '../../errors/NotFoundException'
import { NotificationToken, getNotificationTokens } from '../utils/getNotificationTokens'
import { splitExists } from '../utils/splitExists'
import { Pool } from 'pg'
import {
  AndroidNotificationChannel,
  CompleteSplitEntryArguments,
  LanguageTranslationKey,
} from 'shared'
import NotificationUtils from 'src/notifications/NotificationUtils'

export async function completeSplitEntry(
  pool: Pool,
  callerId: string,
  args: CompleteSplitEntryArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    const groupName =
      (await client.query(`SELECT name from groups WHERE id = $1`, [args.groupId])).rows[0]?.name ??
      ''
    const paidById = (
      await client.query(`SELECT paid_by from splits WHERE id = $1`, [args.splitId])
    ).rows[0]?.paid_by
    const targetUserChange = (
      await client.query(
        `SELECT change FROM split_participants WHERE split_id = $1 AND user_id = $2`,
        [args.splitId, args.userId]
      )
    ).rows[0]?.change

    if (!paidById) {
      throw new NotFoundException('api.notFound.user')
    }

    if (!targetUserChange) {
      throw new NotFoundException('api.notFound.split')
    }

    await client.query(
      'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
      [targetUserChange, args.groupId, args.userId]
    )

    await client.query(
      'UPDATE group_members SET balance = balance - $1 WHERE group_id = $2 AND user_id = $3',
      [targetUserChange, args.groupId, paidById]
    )

    await client.query(
      'UPDATE split_participants SET pending = FALSE WHERE split_id = $1 AND user_id = $2',
      [args.splitId, args.userId]
    )

    await client.query(
      'UPDATE split_participants SET change = change - $1 WHERE split_id = $2 AND user_id = $3',
      [targetUserChange, args.splitId, paidById]
    )

    await client.query('COMMIT')

    let notificationTokens: NotificationToken[]
    let notificationMessage: LanguageTranslationKey

    if (args.userId === callerId) {
      notificationTokens = await getNotificationTokens(client, paidById)
      notificationMessage = 'notification.completeSplit.payeeCompletedEntry'
    } else {
      notificationTokens = await getNotificationTokens(client, args.userId)
      notificationMessage = 'notification.completeSplit.payerCompletedEntry'
    }

    notificationTokens.forEach((token) => {
      NotificationUtils.sendNotification({
        token: token,
        title: groupName,
        body: notificationMessage,
        data: {
          pathToOpen: `/group/${args.groupId}/split/${args.splitId}/`,
        },
        androidChannel: AndroidNotificationChannel.SplitUpdates,
      })
    })
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
