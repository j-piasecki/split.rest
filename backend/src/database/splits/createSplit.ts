import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { userExists } from '../utils/userExists'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateSplitArguments } from 'shared'

export async function createSplit(pool: Pool, callerId: string, args: CreateSplitArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('Group not found')
    }

    if (!(await hasAccessToGroup(client, args.groupId, callerId))) {
      throw new UnauthorizedException('You do not have permission to create splits in this group')
    }

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
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [args.groupId, args.total, args.paidBy, callerId, args.title, args.timestamp, Date.now()]
      )
    ).rows[0].id

    for (const balance of args.balances) {
      if (!(await userExists(client, balance.id))) {
        throw new NotFoundException('User not found in group')
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

    await client.query('COMMIT')

    return splitId
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
