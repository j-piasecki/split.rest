import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { splitExists } from '../utils/splitExists'
import { getSplitInfo } from './getSplitInfo'
import { Pool } from 'pg'
import { SplitWithUsers, UserWithPendingBalanceChange } from 'shared'
import { GetSplitHistoryArguments } from 'shared/src/endpointArguments'

export async function getSplitHistory(
  pool: Pool,
  callerId: string,
  args: GetSplitHistoryArguments
): Promise<SplitWithUsers[]> {
  const client = await pool.connect()

  try {
    const splitHistory: SplitWithUsers[] = []
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    const upToDateInfo = await getSplitInfo(pool, callerId, {
      groupId: args.groupId,
      splitId: args.splitId,
    })

    if (!args.startAfter || upToDateInfo.version < args.startAfter) {
      splitHistory.push(upToDateInfo)
    }

    const editRows = await client.query(
      `
        SELECT 
          split_edits.id,
          split_edits.version,
          split_edits.group_id,
          split_edits.total,
          split_edits.paid_by,
          split_edits.created_by,
          split_edits.name,
          split_edits.timestamp,
          split_edits.updated_at,
          split_edits.type
        FROM split_edits
        WHERE group_id = $1 AND id = $2 AND version < $3
        ORDER BY version DESC
        LIMIT 10
      `,
      [args.groupId, args.splitId, args.startAfter ?? 2147483647]
    )

    for (const row of editRows.rows) {
      const participantRows = (
        await pool.query(
          `
            SELECT 
              users.id, 
              split_participants_edits.change, 
              split_participants_edits.pending, 
              users.name, 
              users.email, 
              users.deleted,
              group_members.display_name
            FROM  users  INNER JOIN split_participants_edits
              ON users.id = split_participants_edits.user_id
              INNER JOIN group_members
              ON users.id = group_members.user_id
            WHERE 
              split_id = $1 AND version = $2 AND group_id = $3
          `,
          [args.splitId, row.version, args.groupId]
        )
      ).rows

      const participants: UserWithPendingBalanceChange[] = participantRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        photoUrl: null,
        change: row.change,
        pending: row.pending,
        deleted: row.deleted,
        displayName: row.display_name,
      }))

      splitHistory.push({
        id: row.id,
        title: row.name,
        total: row.total,
        timestamp: Number(row.timestamp),
        paidById: row.paid_by,
        createdById: row.created_by,
        version: row.version,
        updatedAt: Number(row.updated_at),
        type: row.type,
        users: participants,
        isUserParticipating: upToDateInfo.isUserParticipating,
        pending: participants.some((p) => p.pending),
      })
    }

    await client.query('COMMIT')

    return splitHistory
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
