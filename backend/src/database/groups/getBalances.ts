import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetBalancesArguments, MaybeMemberWithBalanceChange } from 'shared'
import { NotFoundException } from 'src/errors/NotFoundException'

// TODO: Change this to return Member[]
export async function getBalances(
  pool: Pool,
  callerId: string,
  args: GetBalancesArguments
): Promise<MaybeMemberWithBalanceChange[]> {
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
          users.deleted,
          users.picture_id,
          group_members.balance,
          group_members.has_access,
          group_members.is_admin,
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
    deleted: balance.deleted,
    pictureId: balance.picture_id,
    balance: balance.balance,
    change: balance.balance,
    displayName: balance.display_name,
    hasAccess: balance.has_access,
    isAdmin: balance.is_admin,
  }))
}
