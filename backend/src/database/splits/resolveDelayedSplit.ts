import { BadRequestException } from '../../errors/BadRequestException'
import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import NotificationUtils from '../../notifications/NotificationUtils'
import { getAllowedSplitTypes } from '../utils/getAllowedSplitTypes'
import { getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isGroupLocked } from '../utils/isGroupLocked'
import { splitExists } from '../utils/splitExists'
import { validateNormalSplitArgs } from '../utils/validateSplitArgs'
import { updateSplitNoTransaction } from './updateSplit'
import { Pool, PoolClient } from 'pg'
import {
  AndroidNotificationChannel,
  CurrencyUtils,
  ResolveDelayedSplitArguments,
  isBalanceChangeSplit,
  isNormalSplit,
} from 'shared'

async function dispatchNotifications(
  client: PoolClient,
  callerId: string,
  splitId: number,
  args: ResolveDelayedSplitArguments
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

export async function resolveDelayedSplit(
  pool: Pool,
  callerId: string,
  args: ResolveDelayedSplitArguments
) {
  const allowedTypes = await getAllowedSplitTypes(pool, args.groupId)
  if (
    (!isNormalSplit(args.type) && !isBalanceChangeSplit(args.type)) ||
    allowedTypes === null ||
    !allowedTypes.includes(args.type)
  ) {
    throw new BadRequestException('api.split.invalidSplitType')
  }

  if (!isBalanceChangeSplit(args.type)) {
    validateNormalSplitArgs(args)
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

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    await updateSplitNoTransaction(client, callerId, args, false)

    await client.query('UPDATE splits SET type = $1 WHERE id = $2 AND group_id = $3', [
      args.type,
      args.splitId,
      args.groupId,
    ])

    await client.query('COMMIT')
    await dispatchNotifications(client, callerId, args.splitId, args)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
