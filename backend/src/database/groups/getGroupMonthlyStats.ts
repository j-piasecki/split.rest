import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMonthlyStatsArguments, GroupMonthlyStats } from 'shared'

export async function getGroupMonthlyStats(
  pool: Pool,
  callerId: string,
  args: GetGroupMonthlyStatsArguments
): Promise<GroupMonthlyStats | null> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          start_timestamp,
          total_value,
          transaction_count
        FROM group_monthly_stats
        WHERE group_id = $1
        ORDER BY start_timestamp DESC
        LIMIT 24
      `,
      [args.groupId]
    )
  ).rows

  if (rows.length === 0) {
    return null
  }

  return {
    stats: rows.map((row) => ({
      startTimestamp: Number(row.start_timestamp),
      totalValue: row.total_value,
      transactionCount: row.transaction_count,
    })),
  }
}
