import { Pool } from 'pg'

export async function createDatabase(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(512) NULL UNIQUE,
      created_at BIGINT NOT NULL,
      photo_url VARCHAR(512) NULL,
      deleted BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups(
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      created_at BIGINT NOT NULL,
      currency VARCHAR(8) NOT NULL,
      owner VARCHAR(32) NOT NULL,
      total DECIMAL(10, 2) NOT NULL DEFAULT 0,
      member_count SMALLINT NOT NULL DEFAULT 1,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      type SMALLINT NOT NULL,
      last_update BIGINT NOT NULL,
      locked BOOLEAN NOT NULL DEFAULT FALSE,

      FOREIGN KEY (owner) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members(
      group_id INTEGER NOT NULL,
      user_id VARCHAR(32) NOT NULL,
      balance DECIMAL(10, 2) NOT NULL,
      joined_at BIGINT NOT NULL,
      is_admin BOOLEAN NOT NULL,
      has_access BOOLEAN NOT NULL,
      is_hidden BOOLEAN NOT NULL,
      invited_by VARCHAR(32) NOT NULL,
      display_name VARCHAR(128) NULL DEFAULT NULL,

      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (invited_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS splits(
      id SERIAL PRIMARY KEY,
      version INTEGER NOT NULL DEFAULT 1,
      group_id INTEGER NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      paid_by VARCHAR(32) NULL,
      created_by VARCHAR(32) NOT NULL,
      name VARCHAR(512) NOT NULL,
      timestamp BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      type SMALLINT NOT NULL,
      deleted_by VARCHAR(32) NULL,
      deleted_at BIGINT NULL,

      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (paid_by) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS split_edits(
      id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      paid_by VARCHAR(32) NULL,
      created_by VARCHAR(32) NOT NULL,
      name VARCHAR(512) NOT NULL,
      timestamp BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      type SMALLINT NOT NULL,

      PRIMARY KEY (id, version),
      FOREIGN KEY (id) REFERENCES splits(id),
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
      pending BOOLEAN NOT NULL DEFAULT FALSE,

      PRIMARY KEY (split_id, user_id),
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS split_participants_edits(
      split_id INTEGER,
      user_id VARCHAR(32) NOT NULL,
      version INTEGER NOT NULL,
      change DECIMAL(10, 2) NOT NULL,
      pending BOOLEAN NOT NULL DEFAULT FALSE,

      PRIMARY KEY (split_id, user_id, version),
      FOREIGN KEY (split_id) REFERENCES splits(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (split_id, version) REFERENCES split_edits(id, version)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_join_links(
      uuid VARCHAR(36) NOT NULL,
      group_id INTEGER NOT NULL UNIQUE,
      created_by VARCHAR(32) NOT NULL,
      created_at BIGINT NOT NULL,

      PRIMARY KEY (uuid),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_invites(
      group_id INTEGER NOT NULL,
      user_id VARCHAR(32) NOT NULL,
      created_by VARCHAR(32) NOT NULL,
      created_at BIGINT NOT NULL,
      rejected BOOLEAN NOT NULL DEFAULT FALSE,
      withdrawn BOOLEAN NOT NULL DEFAULT FALSE,

      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_tokens(
      user_id VARCHAR(32) NOT NULL,
      token VARCHAR(512) NOT NULL,
      language VARCHAR(4) NOT NULL,
      updated_at BIGINT NOT NULL,

      PRIMARY KEY (user_id, token),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_settings(
      group_id INTEGER NOT NULL,
      split_equally_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      split_exact_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      split_shares_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      split_balance_changes_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      split_lend_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      split_delayed_enabled BOOLEAN NOT NULL DEFAULT TRUE,

      PRIMARY KEY (group_id),
      FOREIGN KEY (group_id) REFERENCES groups(id)
    )
  `)
}
