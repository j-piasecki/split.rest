import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetBalancesArguments, UserWithBalanceChange } from 'shared'
import { NotFoundException } from 'src/errors/NotFoundException'

export async function getBalances(
  pool: Pool,
  callerId: string,
  args: GetBalancesArguments
): Promise<UserWithBalanceChange[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          users.id,
          users.name, 
          users.email,
          group_members.balance,
          group_members.display_name
        FROM group_members
        INNER JOIN users ON group_members.user_id = users.id 
        WHERE group_members.group_id = $1
          AND group_members.user_id = ANY($2)
        ORDER BY group_members.balance ASC
      `,
      [args.groupId, args.users]
    )
  ).rows

  if (args.users.length !== rows.length) {
    throw new NotFoundException('api.notFound.user')
  }

  return rows.map((balance) => ({
    id: balance.id,
    name: balance.name,
    email: balance.email,
    photoUrl: null,
    deleted: balance.deleted,
    change: balance.balance,
    displayName: balance.display_name,
  }))
}
