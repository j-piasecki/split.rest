import { Client, Pool, PoolClient } from 'pg'
import { SplitType } from 'shared'

export async function getAllowedSplitTypes(
  client: Pool | PoolClient | Client,
  groupId: number
): Promise<SplitType[] | null> {
  const allowedMethods = (
    await client.query<{
      split_equally_enabled: boolean
      split_exact_enabled: boolean
      split_shares_enabled: boolean
      split_balance_changes_enabled: boolean
      split_lend_enabled: boolean
      split_delayed_enabled: boolean
    }>(
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
      [groupId]
    )
  ).rows[0]

  if (!allowedMethods) {
    return null
  }

  const allowedTypes: SplitType[] = []

  if (
    allowedMethods.split_equally_enabled ||
    allowedMethods.split_exact_enabled ||
    allowedMethods.split_shares_enabled
  ) {
    allowedTypes.push(SplitType.Normal)
  }

  if (allowedMethods.split_balance_changes_enabled) {
    allowedTypes.push(SplitType.BalanceChange)
  }

  if (allowedMethods.split_lend_enabled) {
    allowedTypes.push(SplitType.Lend)
  }

  if (allowedMethods.split_delayed_enabled) {
    allowedTypes.push(SplitType.Delayed)
  }

  return allowedTypes
}
