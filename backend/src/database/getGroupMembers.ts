import { hasAccessToGroup } from './utils/hasAccessToGroup'
import { UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetGroupMembersArguments, Member } from 'shared'

export async function getGroupMembers(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersArguments
): Promise<Member[]> {
  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('You do not have permission to get members in this group')
  }

  const rows = (
    await pool.query(
      'SELECT users.id, users.name, users.email, users.photo_url, group_members.balance, group_members.has_access, group_members.is_admin FROM group_members JOIN users ON group_members.user_id = users.id WHERE group_id = $1 AND users.id > $2 ORDER BY users.id LIMIT 20',
      [args.groupId, args.startAfter ?? '']
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoURL: row.photo_url,
    balance: row.balance,
    hasAccess: row.has_access,
    isAdmin: row.is_admin,
  }))
}
