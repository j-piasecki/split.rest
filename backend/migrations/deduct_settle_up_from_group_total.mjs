import pg from 'pg'
import { SplitType } from 'shared'

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
    const result = await client.query(
      `
        SELECT groups.id, groups.name, groups.total, sum(splits.total) as deduction
        FROM splits INNER JOIN groups ON splits.group_id = groups.id
        WHERE (splits.type = $1 OR splits.type = $2) AND splits.deleted = FALSE
        GROUP BY groups.id, groups.name, groups.total
      `,
      [SplitType.SettleUp, SplitType.SettleUp | SplitType.Inversed]
    )
    for (const row of result.rows) {
      console.log(
        `Deducting ${row.deduction} from ${row.name} (${row.id}) with current total of ${row.total}`
      )

      if (process.argv.some((arg) => arg === '--commit')) {
        await client.query('UPDATE groups SET total = total - $1 WHERE id = $2', [
          row.deduction,
          row.id,
        ])
      }
    }
    await client.query('COMMIT')
  } finally {
    client.release()
  }
}

main()
