import { hasAccessToGroup } from './utils/hasAccessToGroup'
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import {
  GetBalancesArguments,
  UserWithBalanceChange,
  isGetBalancesWithEmailsArguments,
  isGetBalancesWithIdsArguments,
} from 'shared'

export async function getBalances(
  pool: Pool,
  callerId: string,
  args: GetBalancesArguments
): Promise<UserWithBalanceChange[]> {
  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('User does not have access to group')
  }

  let balances: Record<string, string>[] | null = null
  let targetLength: number | null = null

  if (isGetBalancesWithIdsArguments(args)) {
    const result = await pool.query(
      `
        SELECT 
          users.id,
          users.name, 
          users.email,
          users.photo_url,
          group_members.balance
        FROM group_members
        INNER JOIN users ON group_members.user_id = users.id 
        WHERE group_members.group_id = $1
          AND group_members.user_id = ANY($2)
        ORDER BY group_members.balance ASC
      `,
      [args.groupId, args.users]
    )
    balances = result.rows
    targetLength = result.rowCount
  } else if (isGetBalancesWithEmailsArguments(args)) {
    const result = await pool.query(
      `
        SELECT 
          users.id,
          users.name, 
          users.email,
          users.photo_url,
          group_members.balance
        FROM group_members
        INNER JOIN users ON group_members.user_id = users.id 
        WHERE group_members.group_id = $1
          AND users.email = ANY($2)
        ORDER BY group_members.balance ASC
      `,
      [args.groupId, args.emails]
    )
    balances = result.rows
    targetLength = result.rowCount
  }

  if (targetLength === null || balances === null) {
    throw new BadRequestException('Invalid arguments')
  }

  if (balances.length !== targetLength) {
    throw new NotFoundException('One or more users were not found in the group')
  }

  return balances.map((balance) => ({
    id: balance.id,
    name: balance.name,
    email: balance.email,
    photoURL: balance.photo_url,
    change: balance.balance,
  }))
}
