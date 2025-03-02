import { NotFoundException } from '../../errors/NotFoundException'
import NotificationUtils from '../../notifications/NotificationUtils'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { userExists } from '../utils/userExists'
import { validateNormalSplitArgs } from '../utils/validateNormalSplitArgs'
import { Pool, PoolClient } from 'pg'
import { CreateSplitArguments, CurrencyUtils, SplitType } from 'shared'

export async function createSplitNoTransaction(
  client: PoolClient,
  callerId: string,
  args: CreateSplitArguments
): Promise<number> {
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
      'INSERT INTO split_participants (split_id, user_id, change) VALUES ($1, $2, $3)',
      [splitId, balance.id, balance.change]
    )

    await client.query(
      'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
      [balance.change, args.groupId, balance.id]
    )
  }

  await client.query('UPDATE groups SET total = total + $1 WHERE id = $2', [
    args.total,
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
      })
    })
  })
}

export async function createSplit(pool: Pool, callerId: string, args: CreateSplitArguments) {
  if (args.type === SplitType.Normal) {
    validateNormalSplitArgs(args)
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

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
