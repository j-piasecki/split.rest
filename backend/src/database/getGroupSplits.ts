import { Pool } from 'pg'
import { GetGroupMembersArguments, SplitInfo } from 'shared'

export async function getGroupSplits(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersArguments
): Promise<SplitInfo[]> {
  const hasAccess = (
    await pool.query('SELECT has_access FROM group_members WHERE group_id = $1 AND user_id = $2', [
      args.groupId,
      callerId,
    ])
  ).rows[0]?.has_access

  if (!hasAccess) {
    throw new Error('You do not have permission to restore splits in this group')
  }

  const rows = (
    await pool.query(
      'SELECT id, name, total, paid_by, created_by, timestamp, updated_at, deleted FROM splits WHERE group_id = $1 AND deleted = false AND id > $2 ORDER BY id LIMIT 20',
      [args.groupId, args.startAfter ?? '']
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    total: row.total,
    paidById: row.paid_by,
    createdById: row.created_by,
    timestamp: row.timestamp,
  }))
}
