import dayjs from 'dayjs'
import { Client, Pool, PoolClient } from 'pg'

export type MonthlyStatsUpdate =
  | {
      type: 'createSplit'
      total: string
      timestamp: number
    }
  | {
      type: 'deleteSplit'
      total: string
      timestamp: number
    }
  | {
      type: 'updateSplit'
      total: string
      timestamp: number
      previousTotal: string
      previousTimestamp: number
    }

export async function unsafeUpdateMonthlyStats(
  client: Pool | PoolClient | Client,
  groupId: number,
  update: MonthlyStatsUpdate
): Promise<void> {
  switch (update.type) {
    case 'createSplit': {
      const startDate = dayjs(update.timestamp).startOf('month')
      await client.query(
        `
          INSERT INTO group_monthly_stats (group_id, start_timestamp, total_value, transaction_count)
          VALUES ($1, $2, $3, 1)
          ON CONFLICT (group_id, start_timestamp) DO UPDATE SET
            total_value = group_monthly_stats.total_value + EXCLUDED.total_value,
            transaction_count = group_monthly_stats.transaction_count + 1
        `,
        [groupId, startDate.valueOf(), update.total]
      )
      break
    }
    case 'deleteSplit': {
      const startDate = dayjs(update.timestamp).startOf('month')
      await client.query(
        `
          UPDATE group_monthly_stats
          SET total_value = total_value - $1, transaction_count = transaction_count - 1
          WHERE group_id = $2 AND start_timestamp = $3
        `,
        [update.total, groupId, startDate.valueOf()]
      )
      break
    }
    case 'updateSplit': {
      const previousStartDate = dayjs(update.previousTimestamp).startOf('month')
      const startDate = dayjs(update.timestamp).startOf('month')
      await client.query(
        `
          UPDATE group_monthly_stats
          SET total_value = total_value - $1, transaction_count = transaction_count - 1
          WHERE group_id = $2 AND start_timestamp = $3
        `,
        [update.previousTotal, groupId, previousStartDate.valueOf()]
      )
      await client.query(
        `
          INSERT INTO group_monthly_stats (group_id, start_timestamp, total_value, transaction_count)
          VALUES ($1, $2, $3, 1)
          ON CONFLICT (group_id, start_timestamp) DO UPDATE SET
            total_value = group_monthly_stats.total_value + EXCLUDED.total_value,
            transaction_count = group_monthly_stats.transaction_count + 1
        `,
        [groupId, startDate.valueOf(), update.total]
      )
      break
    }
    default:
      // @ts-expect-error All types should be covered in the switch
      throw new Error(`Unknown update type: ${update.type}`)
  }
}
