import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupInfoArguments, GroupInfo } from 'shared'

export async function getGroupInfo(
  pool: Pool,
  callerId: string,
  args: GetGroupInfoArguments
): Promise<GroupInfo | null> {
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
          groups.member_count,
          group_members.balance, 
          group_members.is_hidden, 
          group_members.is_admin, 
          group_members.has_access
        FROM groups JOIN group_members ON groups.id = group_members.group_id
        WHERE groups.id = $1 AND group_members.user_id = $2
      `,
      [args.groupId, callerId]
    )
  ).rows[0]

  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    currency: row.currency,
    owner: row.owner,
    total: row.total,
    balance: row.balance,
    hidden: row.is_hidden,
    isAdmin: row.is_admin,
    hasAccess: row.has_access,
    memberCount: row.member_count,
  }
}
