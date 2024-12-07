import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetGroupMembersAutocompletionsArguments, User } from 'shared'

export async function getGroupMembersAutocompletions(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersAutocompletionsArguments
): Promise<User[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('Group not found')
  }

  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('You do not have permission to get members in this group')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          users.id, 
          users.name, 
          users.email, 
          users.photo_url
        FROM users JOIN group_members ON users.id = group_members.user_id
        WHERE group_members.group_id = $1 AND (users.name ILIKE $2 OR users.email ILIKE $2)
        ORDER BY users.name
        LIMIT 5
      `,
      [args.groupId, `%${args.query}%`]
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photo_url,
  }))
}
