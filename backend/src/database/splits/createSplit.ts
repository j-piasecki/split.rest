import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import NotificationUtils from '../../notifications/NotificationUtils'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isGroupLocked } from '../utils/isGroupLocked'
import { userExists } from '../utils/userExists'
import { validateLendSplitArgs, validateNormalSplitArgs } from '../utils/validateSplitArgs'
import { Pool, PoolClient } from 'pg'
import {
  AndroidNotificationChannel,
  CreateSplitArguments,
  CurrencyUtils,
  isLendSplit,
  isNormalSplit,
  isSettleUpSplit,
} from 'shared'

export async function createSplitNoTransaction(
  client: PoolClient,
  callerId: string,
  args: CreateSplitArguments
): Promise<number> {
  // TODO: validate currency

  const splitId = (
    await client.query(
      `
        INSERT INTO splits (
          group_id,
          total,
          paid_by,
          created_by,
          name,
          timestamp,
          updated_at,
          type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [
        args.groupId,
        args.total,
        args.paidBy ?? null,
        callerId,
        args.title,
        args.timestamp,
        Date.now(),
        args.type,
      ]
    )
  ).rows[0].id

  for (const balance of args.balances) {
    if (!(await userExists(client, balance.id))) {
      throw new NotFoundException('api.notFound.user')
    }

    await client.query(
      'INSERT INTO split_participants (split_id, user_id, change, pending) VALUES ($1, $2, $3, $4)',
      [splitId, balance.id, balance.change, balance.pending]
    )

    if (!balance.pending) {
      await client.query(
        'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
        [balance.change, args.groupId, balance.id]
      )
    }
  }

  await client.query('UPDATE groups SET total = total + $1, last_update = $2 WHERE id = $3', [
    isSettleUpSplit(args.type) ? 0 : args.total,
    Date.now(),
    args.groupId,
  ])

  return splitId
}

async function dispatchNotifications(
  client: PoolClient,
  callerId: string,
  splitId: number,
  args: CreateSplitArguments
) {
  const groupInfo = (
    await client.query('SELECT name, currency FROM groups WHERE id = $1', [args.groupId])
  ).rows[0]

  const notificationTargets = await Promise.all(
    args.balances
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
            target.change > 0
              ? 'notification.createSplit.youAreOwed'
              : 'notification.createSplit.youOwe',
          args: {
            splitName: args.title,
            amount: CurrencyUtils.format(target.change, groupInfo.currency, false),
          },
        },
        data: {
          pathToOpen: `/group/${args.groupId}/split/${splitId}/`,
        },
        androidChannel: AndroidNotificationChannel.NewSplits,
      })
    })
  })
}

export async function createSplit(pool: Pool, callerId: string, args: CreateSplitArguments) {
  if (isNormalSplit(args.type)) {
    validateNormalSplitArgs(args)
  }

  if (isLendSplit(args.type)) {
    validateLendSplitArgs(args)
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isGroupLocked(client, args.groupId)) {
      throw new ForbiddenException('api.group.locked')
    }

    args.balances.forEach((balance) => {
      // TODO: allow creating pending splits in other way that settle up
      balance.pending = false
    })

    const splitId = await createSplitNoTransaction(client, callerId, args)

    await client.query('COMMIT')
    await dispatchNotifications(client, callerId, splitId, args)

    return splitId
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
