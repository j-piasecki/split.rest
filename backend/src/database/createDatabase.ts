import { Pool } from 'pg'

export async function createDatabase(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(512) NOT NULL,
      created_at bigint NOT NULL,
      photo_url VARCHAR(512) NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups(
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      created_at bigint NOT NULL,
      currency VARCHAR(8) NOT NULL,
      owner VARCHAR(32) NOT NULL,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,

      FOREIGN KEY (owner) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members(
      group_id INTEGER NOT NULL,
      user_id VARCHAR(32) NOT NULL,
      balance DECIMAL(10, 2) NOT NULL,
      is_admin BOOLEAN NOT NULL,
      has_access BOOLEAN NOT NULL,
      is_hidden BOOLEAN NOT NULL,

      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS splits(
      id SERIAL PRIMARY KEY,
      group_id INTEGER NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      paid_by VARCHAR(32) NOT NULL,
      created_by VARCHAR(32) NOT NULL,
      name VARCHAR(512) NOT NULL,
      timestamp bigint NOT NULL,
      updated_at bigint NOT NULL,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,

      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (paid_by) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS split_participants(
      split_id INTEGER,
      user_id VARCHAR(32) NOT NULL,
      change DECIMAL(10, 2) NOT NULL,

      PRIMARY KEY (split_id, user_id),
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
}
