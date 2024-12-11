import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import {
  GetBalancesArguments,
  UserWithBalanceChange,
  isGetBalancesWithEmailsArguments,
  isGetBalancesWithIdsArguments,
} from 'shared'
import { BadRequestException } from 'src/errors/BadRequestException'
import { ForbiddenException } from 'src/errors/ForbiddenException'
import { NotFoundException } from 'src/errors/NotFoundException'

export async function getBalances(
  pool: Pool,
  callerId: string,
  args: GetBalancesArguments
): Promise<UserWithBalanceChange[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new ForbiddenException('api.insufficientPermissions.group.access')
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
    throw new BadRequestException('api.invalidArguments')
  }

  if (balances.length !== targetLength) {
    throw new NotFoundException('api.notFound.user')
  }

  return balances.map((balance) => ({
    id: balance.id,
    name: balance.name,
    email: balance.email,
    photoUrl: balance.photo_url,
    change: balance.balance,
  }))
}
