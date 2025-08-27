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
        SELECT DISTINCT ON (splits.id)
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
          users.name AS paid_by_name,
          users.email AS paid_by_email,
          users.deleted AS paid_by_deleted,
          users.picture_id AS paid_by_picture_id,
          (SELECT EXISTS (SELECT 1 FROM split_participants WHERE split_participants.split_id = splits.id AND pending = true)) AS pending,
          (SELECT change FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $3) AS user_change,
          ${
            args.onlyIfIncluded
              ? 'true AS user_participating'
              : `(SELECT EXISTS (
                    (SELECT 1 WHERE splits.created_by = $3 OR splits.paid_by = $3)
                    UNION
                    (SELECT 1 FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $3)
                    UNION
                    (SELECT 1 FROM split_edits WHERE split_edits.id = splits.id AND (split_edits.created_by = $3 OR split_edits.paid_by = $3))
                    UNION
                    (SELECT 1 FROM split_participants_edits WHERE split_participants_edits.split_id = splits.id AND split_participants_edits.user_id = $3)
                 )) AS user_participating`
          }
        FROM splits
          INNER JOIN split_participants ON splits.id = split_participants.split_id
          LEFT JOIN users ON users.id = splits.paid_by
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

  return rows.map<SplitInfo>((row) => ({
    id: row.id,
    title: row.name,
    total: row.total,
    paidById: row.paid_by,
    paidBy: {
      id: row.paid_by,
      name: row.paid_by_name,
      email: row.paid_by_email,
      deleted: row.paid_by_deleted,
      pictureId: row.paid_by_picture_id,
    },
    createdById: row.created_by,
    timestamp: Number(row.timestamp),
    version: row.version,
    updatedAt: Number(row.updated_at),
    type: row.type,
    isUserParticipating: row.user_participating,
    pending: row.pending,
    userChange: row.user_change,
  }))
}
