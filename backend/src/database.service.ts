import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateGroupArguments, User } from 'shared'

@Injectable()
export class DatabaseService {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      password: 'zaq1@WSX',
      host: 'localhost',
      port: 5432,
      database: 'split',
    })

    this.createDatabase()
  }

  private async createDatabase() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(128),
        email VARCHAR(512),
        created_at bigint,
        photo_url VARCHAR(512) NULL
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS groups(
        id SERIAL PRIMARY KEY,
        name VARCHAR(128),
        created_at bigint,
        currency VARCHAR(8)
      )
    `)

    await this.pool.query(`
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

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        group_id INTEGER,
        total DECIMAL(10, 2),
        paid_by VARCHAR(32),
        created_by VARCHAR(32),
        name VARCHAR(512),
        timestamp bigint,
        updated_at bigint,

        FOREIGN KEY (group_id) REFERENCES groups(id),
        FOREIGN KEY (paid_by) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_participants(
        transaction_id INTEGER,
        user_id VARCHAR(32),
        change DECIMAL(10, 2),

        PRIMARY KEY (transaction_id, user_id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)
  }

  async createOrUpdateUser(user: User) {
    const name = user.name.length > 128 ? user.name.slice(0, 128) : user.name
    const photoURL = user.photoURL.length > 512 ? user.photoURL.slice(0, 512) : user.photoURL

    await this.pool.query(
      `
        INSERT INTO users(id, name, email, created_at, photo_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET email = $3, photo_url = $5
      `,
      [user.id, name, user.email, Date.now(), photoURL]
    )
  }

  async createGroup(userId: string, args: CreateGroupArguments) {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      const { rows } = await client.query(
        `
          INSERT INTO groups(name, created_at, currency)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [args.name, Date.now(), args.currency]
      )

      const groupId = rows[0].id

      await client.query(
        `
          INSERT INTO group_members(group_id, user_id, balance, is_admin, has_access, is_hidden)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [groupId, userId, 0, true, true, false]
      )

      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }
}
