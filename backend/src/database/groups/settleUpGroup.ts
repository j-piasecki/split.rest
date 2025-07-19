import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import NotificationUtils from '../../notifications/NotificationUtils'
import { createSplitNoTransaction } from '../splits/createSplit'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { loadSettleUpData } from '../utils/settleUp/loadSettleUpData'
import { prepareGroupSettleUp } from '../utils/settleUp/prepareGroupSettleUp'
import { Pool, PoolClient } from 'pg'
import { AndroidNotificationChannel, SettleUpGroupArguments, SplitType } from 'shared'

async function dispatchNotifications(
  client: PoolClient,
  callerId: string,
  groupId: number,
  creditors: Set<string>,
  debtors: Set<string>
) {
  const groupInfo = (await client.query('SELECT name FROM groups WHERE id = $1', [groupId])).rows[0]
  const callerInfo = (await client.query('SELECT name FROM users WHERE id = $1', [callerId]))
    .rows[0]

  const notificationTargetsCreditors = await Promise.all(
    Array.from(creditors.values())
      .filter((id) => id !== callerId)
      .map(async (id) => ({
        id: id,
        tokens: await getNotificationTokens(client, id),
      }))
  )

  notificationTargetsCreditors.forEach((target) => {
    target.tokens.forEach((row) => {
      NotificationUtils.sendNotification({
        token: { token: row.token, language: row.language },
        title: groupInfo.name,
        body: {
          key: 'notification.groupSettleUp.youAreOwed',
          args: {
            userName: callerInfo.name,
            groupName: groupInfo.name,
          },
        },
        data: {
          pathToOpen: `/group/${groupId}/`,
        },
        androidChannel: AndroidNotificationChannel.NewSplits,
      })
    })
  })

  const notificationTargetsDebtors = await Promise.all(
    Array.from(debtors.values())
      .filter((id) => id !== callerId)
      .map(async (id) => ({
        id: id,
        tokens: await getNotificationTokens(client, id),
      }))
  )

  notificationTargetsDebtors.forEach((target) => {
    target.tokens.forEach((row) => {
      NotificationUtils.sendNotification({
        token: { token: row.token, language: row.language },
        title: groupInfo.name,
        body: {
          key: 'notification.groupSettleUp.youOwe',
          args: {
            userName: callerInfo.name,
            groupName: groupInfo.name,
          },
        },
        data: {
          pathToOpen: `/group/${groupId}/`,
        },
        androidChannel: AndroidNotificationChannel.NewSplits,
      })
    })
  })
}

export async function settleUpGroup(pool: Pool, callerId: string, args: SettleUpGroupArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    const settleUpData = await loadSettleUpData(client, args.groupId)
    const entries = prepareGroupSettleUp(settleUpData.members, settleUpData.pendingChanges)

    if (entries.length === 0) {
      throw new BadRequestException('api.group.settledUpButPending')
    }

    entries.forEach(async (entry) => {
      await createSplitNoTransaction(client, callerId, {
        groupId: args.groupId,
        title: 'Settle up',
        total: entry.payments.reduce((acc, payment) => acc + Number(payment.amount), 0).toFixed(2),
        timestamp: Date.now(),
        paidBy: entry.targetId,
        balances: [
          ...entry.payments.map((payment) => ({
            id: payment.from,
            change: payment.amount,
            pending: true,
          })),
          {
            id: entry.targetId,
            change: '0.00',
            pending: false,
          },
        ],
        // In group settle up, the debtors always pay the creditors
        type: SplitType.SettleUp | SplitType.Inversed,
        currency: settleUpData.currency,
      })
    })

    const creditors = new Set<string>()
    const debtors = new Set<string>()
    entries.forEach((entry) => {
      creditors.add(entry.targetId)

      entry.payments.forEach((payment) => {
        debtors.add(payment.from)
      })
    })

    await dispatchNotifications(client, callerId, args.groupId, creditors, debtors)

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
