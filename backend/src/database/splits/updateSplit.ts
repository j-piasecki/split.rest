import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { splitExists } from '../utils/splitExists'
import { Pool } from 'pg'
import { UpdateSplitArguments } from 'shared'

export async function updateSplit(pool: Pool, callerId: string, args: UpdateSplitArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await hasAccessToGroup(client, args.groupId, callerId))) {
      throw new ForbiddenException('api.insufficientPermissions.group.access')
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
      }>(
        'SELECT id, version, group_id, total, paid_by, created_by, name, timestamp, updated_at FROM splits WHERE group_id = $1 AND id = $2',
        [args.groupId, args.splitId]
      )
    ).rows[0]

    if (
      splitInfo.created_by !== callerId &&
      splitInfo.paid_by !== callerId &&
      !(await isUserGroupAdmin(client, args.groupId, callerId))
    ) {
      throw new ForbiddenException('api.insufficientPermissions.group.editSplit')
    }

    // Remove old balances

    const splitParticipants = (
      await client.query(
        'SELECT user_id, change FROM split_participants WHERE split_id = $1 AND version = $2',
        [args.splitId, splitInfo.version]
      )
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

    // Save old split info

    const newVersion = (
      await client.query(
        'UPDATE splits SET name = $3, total = $4, paid_by = $5, timestamp = $6, updated_at = $7, version = version + 1, created_by = $8 WHERE group_id = $1 AND id = $2 RETURNING version',
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
    ).rows[0].version

    await client.query(
      'INSERT INTO split_edits (id, version, group_id, total, paid_by, created_by, name, timestamp, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        splitInfo.id,
        newVersion,
        splitInfo.group_id,
        splitInfo.total,
        splitInfo.paid_by,
        splitInfo.created_by,
        splitInfo.name,
        splitInfo.timestamp,
        Date.now(),
      ]
    )

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
        'INSERT INTO split_participants (split_id, user_id, version, change) VALUES ($1, $2, $3, $4)',
        [args.splitId, balance.id, newVersion, balance.change]
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
