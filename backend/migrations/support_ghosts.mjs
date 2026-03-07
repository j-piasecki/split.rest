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

  try {
    await client.query('ALTER TABLE users ADD COLUMN is_ghost BOOLEAN NOT NULL DEFAULT FALSE')
    await client.query(
      'ALTER TABLE users ADD CONSTRAINT users_id_is_ghost_unique UNIQUE (id, is_ghost)'
    )
  } catch (e) {
    console.error(e)
  } finally {
    client.release()
  }
}

main()
