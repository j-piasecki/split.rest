import { addUserToGroup } from '../utils/addUserToGroup'
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
        INSERT INTO groups(name, created_at, currency, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [args.name, Date.now(), args.currency, callerId]
    )

    const groupId = rows[0].id

    await addUserToGroup(client, {
      groupId,
      userId: callerId,
      isAdmin: true,
    })

    await client.query('COMMIT')

    return {
      id: groupId,
      name: args.name,
      currency: args.currency,
      owner: callerId,
      hidden: false,
      isAdmin: true,
      hasAccess: true,
      memberCount: 1,
      balance: '0',
      total: '0.00',
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
