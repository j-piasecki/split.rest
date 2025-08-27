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
    const result = await client.query(`SELECT id FROM users`)
    for (const row of result.rows) {
      console.log(`Backfilling picture id for user ${row.id}`)

      if (process.argv.some((arg) => arg === '--commit')) {
        await client.query(
          `
          UPDATE users SET picture_id = $1 WHERE id = $1
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
