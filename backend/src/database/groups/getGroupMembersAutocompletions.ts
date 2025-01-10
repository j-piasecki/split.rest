import { NotFoundException } from '../../errors/NotFoundException'
import { getMemberPermissions } from '../utils/getMemberPermissions'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMembersAutocompletionsArguments, User } from 'shared'

export async function getGroupMembersAutocompletions(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersAutocompletionsArguments
): Promise<User[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const permissions = await getMemberPermissions(pool, args.groupId, callerId)

  // If the user has read permissions, we can return the autocomplete results
  // for all users in the group. Otherwise, we can only return the autocomplete
  // in case the user knows who they are looking for.
  const rows = permissions?.canReadMembers()
    ? (
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
    : (
        await pool.query(
          `
        SELECT 
          users.id, 
          users.name, 
          users.email, 
          users.photo_url
        FROM users JOIN group_members ON users.id = group_members.user_id
        WHERE group_members.group_id = $1 AND users.email = $2
      `,
          [args.groupId, args.query]
        )
      ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photo_url,
  }))
}
