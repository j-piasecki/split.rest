import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupInfoArguments, GroupUserInfo, SplitMethod } from 'shared'

export async function getGroupInfo(
  pool: Pool,
  callerId: string,
  args: GetGroupInfoArguments
): Promise<GroupUserInfo | null> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const row = (
    await pool.query(
      `
        SELECT 
          groups.id, 
          groups.name, 
          groups.currency,
          groups.owner,
          groups.total,
          groups.type,
          groups.member_count,
          groups.last_update,
          groups.locked,
          group_members.balance, 
          group_members.is_hidden, 
          group_members.is_admin, 
          group_members.has_access,
          group_settings.split_equally_enabled,
          group_settings.split_exact_enabled,
          group_settings.split_shares_enabled,
          group_settings.split_balance_changes_enabled,
          group_settings.split_lend_enabled,
          group_settings.split_delayed_enabled
        FROM groups
          JOIN group_members ON groups.id = group_members.group_id
          JOIN group_settings ON groups.id = group_settings.group_id
        WHERE groups.id = $1 AND group_members.user_id = $2
      `,
      [args.groupId, callerId]
    )
  ).rows[0]

  if (!row) {
    return null
  }

  const allowedSplitMethods: SplitMethod[] = []

  if (row.split_equally_enabled) {
    allowedSplitMethods.push(SplitMethod.Equal)
  }

  if (row.split_exact_enabled) {
    allowedSplitMethods.push(SplitMethod.ExactAmounts)
  }

  if (row.split_shares_enabled) {
    allowedSplitMethods.push(SplitMethod.Shares)
  }

  if (row.split_balance_changes_enabled) {
    allowedSplitMethods.push(SplitMethod.BalanceChanges)
  }

  if (row.split_lend_enabled) {
    allowedSplitMethods.push(SplitMethod.Lend)
  }

  if (row.split_delayed_enabled) {
    allowedSplitMethods.push(SplitMethod.Delayed)
  }

  return {
    id: row.id,
    name: row.name,
    currency: row.currency,
    owner: row.owner,
    total: row.total,
    type: row.type,
    balance: row.balance,
    hidden: row.is_hidden,
    isAdmin: row.is_admin,
    hasAccess: row.has_access,
    memberCount: row.member_count,
    lastUpdate: Number(row.last_update),
    locked: row.locked,
    allowedSplitMethods,
  }
}
