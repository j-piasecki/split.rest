import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { loadSettleUpData, prepareSettleUp } from '../utils/settleUp'
import { createSplitNoTransaction } from './createSplit'
import hash from 'object-hash'
import { Pool, PoolClient } from 'pg'
import {
  AndroidNotificationChannel,
  BalanceChange,
  ConfirmSettleUpArguments,
  CurrencyUtils,
  SplitInfo,
  SplitType,
} from 'shared'
import NotificationUtils from 'src/notifications/NotificationUtils'

async function dispatchNotifications(
  client: PoolClient,
  callerId: string,
  groupId: number,
  splitId: number,
  entries: BalanceChange[]
) {
  const groupInfo = (
    await client.query('SELECT name, currency FROM groups WHERE id = $1', [groupId])
  ).rows[0]

  const callerInfo = (await client.query('SELECT name FROM users WHERE id = $1', [callerId]))
    .rows[0]

  const notificationTargets = await Promise.all(
    entries
      .map((entry) => ({
        id: entry.id,
        change: Number(entry.change),
      }))
      .filter((entry) => entry.id !== callerId && entry.change !== 0)
      .map(async (entry) => ({
        id: entry.id,
        change: entry.change,
        tokens: await getNotificationTokens(client, entry.id),
      }))
  )

  notificationTargets.forEach((target) => {
    target.tokens.forEach((row) => {
      NotificationUtils.sendNotification({
        token: { token: row.token, language: row.language },
        title: groupInfo.name,
        body: {
          key:
            target.change > 0 ? 'notification.settleUp.youOwe' : 'notification.settleUp.youAreOwed',
          args: {
            userName: callerInfo.name,
            amount: CurrencyUtils.format(target.change, groupInfo.currency, false),
          },
        },
        data: {
          pathToOpen: `/group/${groupId}/split/${splitId}/`,
        },
        androidChannel: AndroidNotificationChannel.NewSplits,
      })
    })
  })
}

async function createAndSaveSettleUpSplit(
  client: PoolClient,
  callerId: string,
  total: number,
  entries: BalanceChange[],
  groupId: number,
  currency: string
): Promise<SplitInfo> {
  const splitType = SplitType.SettleUp | (total > 0 ? SplitType.Inversed : SplitType.Normal)

  const splitId = await createSplitNoTransaction(client, callerId, {
    groupId: groupId,
    total: Math.abs(total).toFixed(2),
    paidBy: callerId,
    title: 'Settle up',
    timestamp: Date.now(),
    balances: entries,
    type: splitType,
    currency: currency,
  })

  await dispatchNotifications(client, callerId, groupId, splitId, entries)

  return {
    id: splitId,
    version: 1,
    total: Math.abs(total).toFixed(2),
    paidById: callerId,
    createdById: callerId,
    title: 'Settle up',
    timestamp: Date.now(),
    updatedAt: Date.now(),
    isUserParticipating: true,
    type: splitType,
    pending: false,
  }
}

export async function confirmSettleUp(
  pool: Pool,
  callerId: string,
  args: ConfirmSettleUpArguments
): Promise<SplitInfo> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await isUserMemberOfGroup(client, args.groupId, callerId))) {
      throw new NotFoundException('api.notFound.group')
    }

    const balance = Number(
      (
        await client.query<{ balance: string }>(
          `SELECT balance from group_members WHERE group_id = $1 AND user_id = $2`,
          [args.groupId, callerId]
        )
      ).rows[0].balance
    )

    if (balance === 0) {
      throw new BadRequestException('api.split.cannotSettleUpNeutral')
    }

    const settleUpData = await loadSettleUpData(client, args.groupId)
    const entries = prepareSettleUp(
      callerId,
      balance,
      settleUpData.members,
      settleUpData.pendingChanges,
      args.withMembers
    )
    const entriesHash = hash(entries, { algorithm: 'sha1', encoding: 'base64' })

    if (entriesHash !== args.entriesHash) {
      throw new BadRequestException('api.split.settleUpHashChanged')
    }

    const total = entries.reduce((acc, entry) => acc + Number(entry.change), 0)
    const split = await createAndSaveSettleUpSplit(
      client,
      callerId,
      total,
      entries,
      args.groupId,
      settleUpData.currency
    )

    await client.query('COMMIT')

    return split
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
