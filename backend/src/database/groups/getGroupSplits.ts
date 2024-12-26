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
          splits.type,
          ${args.onlyIfIncluded ? 'true AS user_participating' : `(SELECT EXISTS (SELECT 1 FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $3)) AS user_participating`}
        FROM splits ${args.onlyIfIncluded ? 'INNER JOIN split_participants ON splits.id = split_participants.split_id' : ''}
        WHERE
          group_id = $1
          ${args.onlyIfIncluded ? 'AND split_participants.user_id = $3' : ''}
          AND deleted = false
          AND id < $2
        ORDER BY id DESC
        LIMIT 20
      `,
      [args.groupId, args.startAfterId ?? 2147483647, callerId]
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
    isUserParticipating: row.user_participating,
  }))
}
