import { addUserToGroup } from '../utils/addUserToGroup'
import { validateCurrency } from '../utils/validateCurrency'
import { Pool } from 'pg'
import { CreateGroupArguments, GroupType, GroupUserInfo } from 'shared'

export async function createGroup(
  pool: Pool,
  callerId: string,
  args: CreateGroupArguments
): Promise<GroupUserInfo> {
  const client = await pool.connect()

  try {
    validateCurrency(args.currency)

    await client.query('BEGIN')

    const { rows } = await client.query(
      `
        INSERT INTO groups(name, created_at, currency, owner, type, last_update)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [args.name, Date.now(), args.currency, callerId, GroupType.Normal, Date.now()]
    )

    const groupId = rows[0].id

    await addUserToGroup(client, {
      groupId,
      userId: callerId,
      isAdmin: true,
      invitedBy: callerId,
    })

    await client.query('COMMIT')

    return {
      id: groupId,
      name: args.name,
      currency: args.currency,
      owner: callerId,
      type: GroupType.Normal,
      hidden: false,
      isAdmin: true,
      hasAccess: true,
      memberCount: 1,
      balance: '0',
      total: '0.00',
      lastUpdate: Date.now(),
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
