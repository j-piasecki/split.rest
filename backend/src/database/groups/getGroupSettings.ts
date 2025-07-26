import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupSettingsArguments, SplitMethod } from 'shared'

// TODO: Remove this function and related endpoints/types/helpers
export async function getGroupSettings(
  pool: Pool,
  callerId: string,
  args: GetGroupSettingsArguments
): Promise<{
  allowedSplitMethods: SplitMethod[]
}> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const row = (
    await pool.query(
      `
        SELECT 
          split_equally_enabled,
          split_exact_enabled,
          split_shares_enabled,
          split_balance_changes_enabled,
          split_lend_enabled,
          split_delayed_enabled
        FROM group_settings
        WHERE group_id = $1
      `,
      [args.groupId]
    )
  ).rows[0]

  if (!row) {
    throw new NotFoundException('api.notFound.group')
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
    allowedSplitMethods,
  }
}
