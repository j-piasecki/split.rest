import { Pool } from 'pg'
import { CreateGroupArguments, GroupInfo } from 'shared'

export async function createGroup(
  pool: Pool,
  callerId: string,
  args: CreateGroupArguments
): Promise<GroupInfo> {
  const client = await pool.connect()

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
      [groupId, callerId, 0, true, true, false]
    )

    await client.query('COMMIT')

    return {
      id: groupId,
      name: args.name,
      currency: args.currency,
      hidden: false,
      isAdmin: true,
      hasAccess: true,
      memberCount: 1,
      balance: '0',
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
