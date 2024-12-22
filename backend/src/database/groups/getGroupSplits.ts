import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupSplitsArguments, SplitInfo } from 'shared'

export async function getGroupSplits(
  pool: Pool,
  callerId: string,
  args: GetGroupSplitsArguments
): Promise<SplitInfo[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          splits.id,
          splits.name,
          splits.total,
          splits.paid_by,
          splits.created_by,
          splits.timestamp,
          splits.updated_at,
          splits.version,
          splits.deleted,
          splits.type
        FROM splits ${args.onlyIfIncluded ? 'INNER JOIN split_participants ON splits.id = split_participants.split_id' : ''}
        WHERE
          group_id = $1
          ${args.onlyIfIncluded ? 'AND split_participants.user_id = $3' : ''}
          AND deleted = false
          AND timestamp < $2
        ORDER BY timestamp DESC
        LIMIT 20
      `,
      args.onlyIfIncluded
        ? [args.groupId, args.startAfterTimestamp ?? Number.MAX_SAFE_INTEGER, callerId]
        : [args.groupId, args.startAfterTimestamp ?? Number.MAX_SAFE_INTEGER]
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    total: row.total,
    paidById: row.paid_by,
    createdById: row.created_by,
    timestamp: Number(row.timestamp),
    version: row.version,
    updatedAt: Number(row.updated_at),
    type: row.type,
  }))
}
