import { Pool } from 'pg'
import { GetUserGroupsArguments, GroupInfo } from 'shared'

export async function getUserGroups(
  pool: Pool,
  callerId: string,
  args: GetUserGroupsArguments
): Promise<GroupInfo[]> {
  const rows = (
    await pool.query(
      `
        SELECT 
          groups.id, 
          groups.name, 
          groups.currency,
          groups.owner,
          groups.deleted,
          groups.total,
          groups.member_count,
          groups.type,
          group_members.balance, 
          group_members.is_hidden, 
          group_members.is_admin, 
          group_members.has_access
        FROM groups JOIN group_members ON groups.id = group_members.group_id
        WHERE group_members.user_id = $1 AND group_members.is_hidden = $2 AND groups.id < $3 AND groups.deleted = FALSE
        ORDER BY
          groups.id DESC
        LIMIT 20;
      `,
      [callerId, args.hidden, args.startAfter ?? 2147483647]
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    currency: row.currency,
    owner: row.owner,
    balance: row.balance,
    hidden: row.is_hidden,
    isAdmin: row.is_admin,
    hasAccess: row.has_access,
    memberCount: row.member_count,
    total: row.total,
    type: row.type,
  }))
}
