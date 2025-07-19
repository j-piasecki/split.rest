import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { NotificationToken, getNotificationTokens } from '../utils/getNotificationTokens'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isGroupLocked } from '../utils/isGroupLocked'
import { splitExists } from '../utils/splitExists'
import { validateNormalSplitArgs } from '../utils/validateNormalSplitArgs'
import { Pool, PoolClient } from 'pg'
import {
  AndroidNotificationChannel,
  CurrencyUtils,
  LanguageTranslationKey,
  SplitType,
  UpdateSplitArguments,
  isNormalSplit,
  isSettleUpSplit,
} from 'shared'
import NotificationUtils from 'src/notifications/NotificationUtils'

async function dispatchNotificationBatch(
  groupName: string,
  currency: string,
  splitName: string,
  messagePositive: LanguageTranslationKey,
  messageNegative: LanguageTranslationKey,
  data: Record<string, string>,
  batch: { tokens: NotificationToken[]; change: number }[]
) {
  batch.forEach((notification) => {
    notification.tokens.forEach((token) => {
      NotificationUtils.sendNotification({
        token: token,
        title: groupName,
        body: {
          key: notification.change > 0 ? messagePositive : messageNegative,
          args: {
            splitName: splitName,
            amount: CurrencyUtils.format(notification.change, currency, false),
          },
        },
        data: data,
        androidChannel: AndroidNotificationChannel.SplitUpdates,
      })
    })
  })
}

async function dispatchNotifications(
  client: PoolClient,
  callerId: string,
  splitName: string,
  args: UpdateSplitArguments,
  previousParticipants: { user_id: string; change: string }[]
) {
  const groupInfo = (
    await client.query('SELECT name, currency FROM groups WHERE id = $1', [args.groupId])
  ).rows[0]

  const oldParticipants = new Map<string, string>(
    previousParticipants.map((participant) => [participant.user_id, participant.change])
  )
  const newParticipants = new Map<string, string>(
    args.balances.map((balance) => [balance.id, balance.change])
  )

  const addedToSplit = await Promise.all(
    args.balances
      .map((balance) => ({
        id: balance.id,
        change: Number(balance.change),
      }))
      .filter((balance) => !oldParticipants.has(balance.id) && balance.change !== 0)
      .map(async (balance) => ({
        ...balance,
        tokens: await getNotificationTokens(client, balance.id),
      }))
  )
  const removedFromSplit = await Promise.all(
    previousParticipants
      .filter((participant) => !newParticipants.has(participant.user_id))
      .map(async (participant) => ({
        id: participant.user_id,
        change: Number(participant.change),
        tokens: await getNotificationTokens(client, participant.user_id),
      }))
  )
  const updated = await Promise.all(
    args.balances
      .filter(
        (balance) =>
          oldParticipants.has(balance.id) &&
          newParticipants.has(balance.id) &&
          oldParticipants.get(balance.id) !== balance.change
      )
      .map(async (balance) => ({
        id: balance.id,
        change: Number(balance.change),
        tokens: await getNotificationTokens(client, balance.id),
      }))
  )

  const data = {
    pathToOpen: `/group/${args.groupId}/split/${args.splitId}/`,
  }

  ;(
    [
      {
        batch: addedToSplit,
        messagePositive: 'notification.updateSplit.addedYouAreOwed',
        messageNegative: 'notification.updateSplit.addedYouOwe',
      },
      {
        batch: removedFromSplit,
        messagePositive: 'notification.updateSplit.removedYouAreOwed',
        messageNegative: 'notification.updateSplit.removedYouOwe',
      },
      {
        batch: updated,
        messagePositive: 'notification.updateSplit.updatedYouAreOwed',
        messageNegative: 'notification.updateSplit.updatedYouOwe',
      },
    ] as const
  ).forEach((notification) => {
    dispatchNotificationBatch(
      groupInfo.name,
      groupInfo.currency,
      splitName,
      notification.messagePositive,
      notification.messageNegative,
      data,
      notification.batch
    )
  })
}

export async function updateSplit(pool: Pool, callerId: string, args: UpdateSplitArguments) {
  const client = await pool.connect()
  try {
    // TODO: validate currency

    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    if (await isGroupLocked(client, args.groupId)) {
      throw new ForbiddenException('api.group.locked')
    }

    const splitInfo = (
      await client.query<{
        id: number
        version: number
        group_id: number
        total: string
        paid_by: string
        created_by: string
        name: string
        timestamp: number
        updated_at: number
        type: SplitType
      }>(
        'SELECT id, version, group_id, total, paid_by, created_by, name, timestamp, updated_at, type FROM splits WHERE group_id = $1 AND id = $2',
        [args.groupId, args.splitId]
      )
    ).rows[0]

    if (isNormalSplit(splitInfo.type)) {
      validateNormalSplitArgs(args)
    }

    if (isSettleUpSplit(splitInfo.type)) {
      throw new ForbiddenException('api.split.cannotEditSettleUp')
    }

    // Remove old balances

    const splitParticipants = (
      await client.query<{ user_id: string; change: string; pending: boolean }>(
        'SELECT user_id, change, pending FROM split_participants WHERE split_id = $1',
        [args.splitId]
      )
    ).rows

    for (const participant of splitParticipants) {
      if (participant.pending) {
        continue
      }

      await client.query(
        'UPDATE group_members SET balance = balance - $1 WHERE group_id = $2 AND user_id = $3',
        [participant.change, args.groupId, participant.user_id]
      )
    }

    await client.query('UPDATE groups SET total = total - $1 WHERE id = $2', [
      splitInfo.total,
      args.groupId,
    ])

    await client.query('DELETE FROM split_participants WHERE split_id = $1', [args.splitId])

    // Save old split info

    await client.query(
      'UPDATE splits SET name = $3, total = $4, paid_by = $5, timestamp = $6, updated_at = $7, version = version + 1, created_by = $8 WHERE group_id = $1 AND id = $2',
      [
        args.groupId,
        args.splitId,
        args.title,
        args.total,
        args.paidBy ?? null,
        args.timestamp,
        Date.now(),
        callerId,
      ]
    )

    await client.query(
      'INSERT INTO split_edits (id, version, group_id, total, paid_by, created_by, name, timestamp, updated_at, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        splitInfo.id,
        splitInfo.version,
        splitInfo.group_id,
        splitInfo.total,
        splitInfo.paid_by,
        splitInfo.created_by,
        splitInfo.name,
        splitInfo.timestamp,
        splitInfo.updated_at,
        splitInfo.type,
      ]
    )

    for (const participant of splitParticipants) {
      await client.query(
        'INSERT INTO split_participants_edits (split_id, user_id, version, change, pending) VALUES ($1, $2, $3, $4, $5)',
        [
          args.splitId,
          participant.user_id,
          splitInfo.version,
          participant.change,
          participant.pending,
        ]
      )
    }

    // Apply new balances

    for (const balance of args.balances) {
      const userExists = (
        await client.query('SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2', [
          args.groupId,
          balance.id,
        ])
      ).rowCount

      if (!userExists) {
        throw new NotFoundException('api.notFound.user')
      }

      await client.query(
        'INSERT INTO split_participants (split_id, user_id, change, pending) VALUES ($1, $2, $3, $4)',
        [args.splitId, balance.id, balance.change, false] // TODO: allow creating pending splits other in way than settle up?
      )

      if (!balance.pending) {
        await client.query(
          'UPDATE group_members SET balance = balance + $1 WHERE group_id = $2 AND user_id = $3',
          [balance.change, args.groupId, balance.id]
        )
      }
    }

    await client.query('UPDATE groups SET total = total + $1, last_update = $2 WHERE id = $3', [
      args.total,
      Date.now(),
      args.groupId,
    ])

    await client.query('COMMIT')

    await dispatchNotifications(client, callerId, splitInfo.name, args, splitParticipants)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
