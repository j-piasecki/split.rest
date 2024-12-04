import { hasAccessToGroup } from './utils/hasAccessToGroup'
import { UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetBalancesArguments, UserWithBalanceChange } from 'shared'

export async function getBalances(
  pool: Pool,
  callerId: string,
  args: GetBalancesArguments
): Promise<UserWithBalanceChange[]> {
  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('User does not have access to group')
  }

  const balances = await pool.query<UserWithBalanceChange>(
    'SELECT users.id, users.name, users.email, users.photo_url, group_members.balance FROM group_members INNER JOIN users ON group_members.user_id = users.id WHERE group_members.group_id = $1 AND group_members.user_id = ANY($2) ORDER BY group_members.balance ASC',
    [args.groupId, args.users]
  )

  return balances.rows
}
