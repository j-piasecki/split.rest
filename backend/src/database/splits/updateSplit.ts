import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { splitExists } from '../utils/splitExists'
import { Pool } from 'pg'
import { SplitType, UpdateSplitArguments } from 'shared'

export async function updateSplit(pool: Pool, callerId: string, args: UpdateSplitArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
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

    if (splitInfo.type & SplitType.SettleUp) {
      throw new ForbiddenException('api.split.cannotEditSettleUp')
    }

    // Remove old balances

    const splitParticipants = (
      await client.query('SELECT user_id, change FROM split_participants WHERE split_id = $1', [
        args.splitId,
      ])
    ).rows

    for (const participant of splitParticipants) {
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
        args.paidBy,
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
        'INSERT INTO split_participants_edits (split_id, user_id, version, change) VALUES ($1, $2, $3, $4)',
        [args.splitId, participant.user_id, splitInfo.version, participant.change]
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
        'INSERT INTO split_participants (split_id, user_id, change) VALUES ($1, $2, $3)',
        [args.splitId, balance.id, balance.change]
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

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
