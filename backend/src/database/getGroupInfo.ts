import { isUserMemberOfGroup } from './utils/isUserMemberOfGroup'
import { UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetGroupInfoArguments, GroupInfo } from 'shared'

export async function getGroupInfo(
  pool: Pool,
  callerId: string,
  args: GetGroupInfoArguments
): Promise<GroupInfo | null> {
  if (!(await isUserMemberOfGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException()
  }

  const row = (
    await pool.query(
      `
        SELECT 
          groups.id, 
          groups.name, 
          groups.currency,
          groups.owner,
          group_members.balance, 
          group_members.is_hidden, 
          group_members.is_admin, 
          group_members.has_access,
          (SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id) AS member_count
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
    balance: row.balance,
    hidden: row.is_hidden,
    isAdmin: row.is_admin,
    hasAccess: row.has_access,
    memberCount: row.member_count,
  }
}
