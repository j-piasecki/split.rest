import { BadRequestException } from '../../errors/BadRequestException'
import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isGroupLocked } from '../utils/isGroupLocked'
import { updateSplitNoTransaction } from './updateSplit'
import { assert } from 'console'
import currencyJs from 'currency.js'
import { Pool, PoolClient } from 'pg'
import {
  DelayedSplitResolutionMethod,
  ResolveAllDelayedSplitsAtOnceArguments,
  SplitType,
} from 'shared'

async function resolveDelayedSplit(
  client: PoolClient,
  callerId: string,
  groupId: number,
  splitId: number,
  resolutionMethod: DelayedSplitResolutionMethod,
  currency: string
) {
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
      [groupId, splitId]
    )
  ).rows[0]

  if (splitInfo === undefined || splitInfo.type !== SplitType.Delayed) {
    throw new NotFoundException('api.notFound.split')
  }

  if (!resolutionMethod.members.includes(splitInfo.paid_by)) {
    throw new ForbiddenException('api.split.delayedSplitMustBeResolvedWithPayer')
  }

  if (resolutionMethod.type === 'equally') {
    const amountsPaid = currencyJs(splitInfo.total)
      .distribute(resolutionMethod.members.length)
      .map((amount, index) => {
        if (resolutionMethod.members[index] === splitInfo.paid_by) {
          return currencyJs(splitInfo.total).subtract(amount)
        }
        return amount.multiply(-1)
      })

    assert(amountsPaid.reduce((acc, amount) => acc.add(amount), currencyJs(0)).intValue === 0)

    await updateSplitNoTransaction(
      client,
      callerId,
      {
        groupId: groupId,
        splitId: splitId,
        paidBy: splitInfo.paid_by,
        title: splitInfo.name,
        total: splitInfo.total,
        timestamp: splitInfo.timestamp,
        balances: resolutionMethod.members.map((member, index) => ({
          id: member,
          change: amountsPaid[index].toString(),
          pending: false,
        })),
        currency: currency,
      },
      false
    )

    await client.query('UPDATE splits SET type = $1 WHERE id = $2 AND group_id = $3', [
      SplitType.Normal,
      splitId,
      groupId,
    ])
  } else {
    throw new BadRequestException('api.split.invalidResolutionMethod')
  }
}

export async function resolveAllDelayedSplits(
  pool: Pool,
  callerId: string,
  args: ResolveAllDelayedSplitsAtOnceArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isGroupLocked(client, args.groupId)) {
      throw new ForbiddenException('api.group.locked')
    }

    // TODO: read currency from the original split once it's stored in the database
    const groupInfo = (
      await client.query<{ currency: string }>('SELECT currency FROM groups WHERE id = $1', [
        args.groupId,
      ])
    ).rows[0]

    const splitsToFinalize = await client.query<{ id: number }>(
      'SELECT id FROM splits WHERE group_id = $1 AND type = $2 AND deleted = FALSE',
      [args.groupId, SplitType.Delayed]
    )

    for (const split of splitsToFinalize.rows) {
      await resolveDelayedSplit(
        client,
        callerId,
        args.groupId,
        split.id,
        args.resolutionMethod,
        groupInfo.currency
      )
    }

    await client.query('COMMIT')

    // TODO: should this dispatch notifications?
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
