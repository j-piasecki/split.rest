import { Pool } from 'pg'

export async function createDatabase(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(128),
      email VARCHAR(512),
      created_at bigint,
      photo_url VARCHAR(512) NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups(
      id SERIAL PRIMARY KEY,
      name VARCHAR(128),
      created_at bigint,
      currency VARCHAR(8)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members(
      group_id INTEGER,
      user_id VARCHAR(32),
      balance DECIMAL(10, 2),
      is_admin BOOLEAN,
      has_access BOOLEAN,
      is_hidden BOOLEAN,

      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS splits(
      id SERIAL PRIMARY KEY,
      group_id INTEGER,
      total DECIMAL(10, 2),
      paid_by VARCHAR(32),
      created_by VARCHAR(32),
      name VARCHAR(512),
      timestamp bigint,
      updated_at bigint,
      deleted BOOLEAN DEFAULT FALSE,

      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (paid_by) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS split_participants(
      split_id INTEGER,
      user_id VARCHAR(32),
      change DECIMAL(10, 2),

      PRIMARY KEY (split_id, user_id),
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
}
