import { BadRequestException } from '../../errors/BadRequestException'
import { addUserToGroup } from '../utils/addUserToGroup'
import { validateCurrency } from '../utils/validateCurrency'
import { Pool } from 'pg'
import {
  CreateGroupArguments,
  GroupType,
  GroupUserInfo,
  SplitMethod,
  validateAllowedSplitMethods,
} from 'shared'

const DefaultAllowedSplitMethods: SplitMethod[] = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.BalanceChanges,
  SplitMethod.Lend,
  SplitMethod.Delayed,
]

export async function createGroup(
  pool: Pool,
  callerId: string,
  args: CreateGroupArguments
): Promise<GroupUserInfo> {
  const client = await pool.connect()
  const allowedSplitMethods = args.allowedSplitMethods ?? DefaultAllowedSplitMethods

  const error = validateAllowedSplitMethods(allowedSplitMethods)
  if (error) {
    throw new BadRequestException(error)
  }

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

    await client.query(
      `
        INSERT INTO group_settings(group_id, split_equally_enabled, split_exact_enabled, split_shares_enabled, split_balance_changes_enabled, split_lend_enabled, split_delayed_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        groupId,
        allowedSplitMethods.includes(SplitMethod.Equal),
        allowedSplitMethods.includes(SplitMethod.ExactAmounts),
        false,
        allowedSplitMethods.includes(SplitMethod.BalanceChanges),
        allowedSplitMethods.includes(SplitMethod.Lend),
        allowedSplitMethods.includes(SplitMethod.Delayed),
      ]
    )

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
      locked: false,
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
