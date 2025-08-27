import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMembersArguments, Member } from 'shared'

export async function getGroupMembers(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersArguments
): Promise<Member[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    args.lowToHigh === undefined
      ? await pool.query(
          `
          SELECT 
            users.id,
            users.name,
            users.email, 
            users.deleted,
            group_members.balance,
            group_members.has_access,
            group_members.is_admin,
            group_members.display_name
          FROM group_members 
          JOIN users ON group_members.user_id = users.id 
          WHERE group_id = $1 
            AND users.id > $2 
          ORDER BY users.id 
          LIMIT 20
          `,
          [args.groupId, args.startAfter ?? '']
        )
      : await pool.query(
          `
          SELECT 
            users.id,
            users.name,
            users.email, 
            users.deleted,
            group_members.balance,
            group_members.has_access,
            group_members.is_admin,
            group_members.display_name
          FROM group_members 
          JOIN users ON group_members.user_id = users.id 
          WHERE group_members.group_id = $1
            AND (
              group_members.balance ${args.lowToHigh ? '>' : '<'} $2
              OR (group_members.balance = $2 AND users.id > $3)
            )
          ORDER BY group_members.balance ${args.lowToHigh ? 'ASC' : 'DESC'}, users.id
          LIMIT 20
          `,
          [
            args.groupId,
            args.startAfterBalance ??
              (args.lowToHigh ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER),
            args.startAfter ?? '',
          ]
        )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    deleted: row.deleted,
    balance: row.balance,
    hasAccess: row.has_access,
    isAdmin: row.is_admin,
    displayName: row.display_name,
  }))
}
