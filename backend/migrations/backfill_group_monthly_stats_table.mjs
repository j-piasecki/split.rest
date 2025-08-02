import dayjs from 'dayjs'
import pg from 'pg'

const pool = new pg.Pool({
  user: process.env.SPLIT_USER,
  password: process.env.SPLIT_PASSWORD,
  host: process.env.SPLIT_HOST,
  port: Number(process.env.SPLIT_PORT),
  database: process.env.SPLIT_DATABASE,
})

async function main() {
  const client = await pool.connect()
  await client.query('BEGIN')
  try {
    const result = await client.query(`SELECT id FROM groups`)
    for (const row of result.rows) {
      console.log(`Backfilling group monthly stats for group ${row.id}`)

      const splits = await client.query(
        `SELECT id, total, timestamp, type FROM splits WHERE group_id = $1 AND deleted = false`,
        [row.id]
      )
      for (const split of splits.rows) {
        if ((Number(split.type) & 2) !== 0) {
          console.log(`  Skipping settle up split ${split.id}`)
          continue
        }

        const startDate = dayjs(Number(split.timestamp)).startOf('month')
        console.log(
          `  Processing split ${split.id} with total ${split.total} and start date ${startDate.valueOf()}`
        )

        if (process.argv.some((arg) => arg === '--commit')) {
          await client.query(
            `
              INSERT INTO group_monthly_stats (group_id, start_timestamp, total_value, transaction_count)
              VALUES ($1, $2, $3, 1)
              ON CONFLICT (group_id, start_timestamp) DO UPDATE SET
                total_value = group_monthly_stats.total_value + EXCLUDED.total_value,
                transaction_count = group_monthly_stats.transaction_count + 1
            `,
            [row.id, startDate.valueOf(), split.total]
          )
        }
      }
    }
    await client.query('COMMIT')
  } catch (e) {
    console.error(e)
    await client.query('ROLLBACK')
  } finally {
    client.release()
  }
}

main()
