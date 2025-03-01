import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMemberInfoArguments, Member } from 'shared'

export async function getMemberInfo(
  pool: Pool,
  callerId: string,
  args: GetGroupMemberInfoArguments
): Promise<Member> {
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
          group_members.balance,
          group_members.has_access,
          group_members.is_admin,
          group_members.display_name
        FROM group_members 
        JOIN users ON group_members.user_id = users.id 
        WHERE group_id = $1 AND users.id = $2 
      `,
      [args.groupId, args.memberId ?? '']
    )
  ).rows

  if (rows.length === 0) {
    throw new NotFoundException('api.group.userNotInGroup')
  }

  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    photoUrl: null,
    deleted: rows[0].deleted,
    balance: rows[0].balance,
    hasAccess: rows[0].has_access,
    isAdmin: rows[0].is_admin,
    displayName: rows[0].display_name,
  }
}
