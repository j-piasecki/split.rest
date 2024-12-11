import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { hasAccessToGroup } from '../utils/hasAccessToGroup'
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

  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new ForbiddenException('api.insufficientPermissions.group.access')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          id,
          name,
          total,
          paid_by,
          created_by,
          timestamp,
          updated_at,
          version,
          deleted
        FROM splits
        WHERE
          group_id = $1
          AND deleted = false
          AND timestamp < $2
        ORDER BY timestamp DESC
        LIMIT 20
      `,
      [args.groupId, args.startAfterTimestamp ?? Number.MAX_SAFE_INTEGER]
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
  }))
}
