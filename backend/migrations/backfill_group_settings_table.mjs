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
      console.log(`Backfilling group settings for group ${row.id}`)

      if (process.argv.some((arg) => arg === '--commit')) {
        await client.query(
          `
          INSERT INTO group_settings (group_id, split_equally_enabled, split_exact_enabled, split_shares_enabled, split_balance_changes_enabled, split_lend_enabled, split_delayed_enabled)
          VALUES ($1, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE)
          `,
          [row.id]
        )
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
