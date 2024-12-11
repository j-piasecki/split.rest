import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { hasAccessToGroup } from '../utils/hasAccessToGroup'
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

  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new ForbiddenException('api.insufficientPermissions.group.access')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          users.id,
          users.name,
          users.email, 
          users.photo_url,
          group_members.balance,
          group_members.has_access,
          group_members.is_admin 
        FROM group_members 
        JOIN users ON group_members.user_id = users.id 
        WHERE group_id = $1 
          AND users.id > $2 
        ORDER BY users.id 
        LIMIT 20
      `,
      [args.groupId, args.startAfter ?? '']
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photo_url,
    balance: row.balance,
    hasAccess: row.has_access,
    isAdmin: row.is_admin,
  }))
}
