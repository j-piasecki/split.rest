import { Pool } from 'pg'
import { GetGroupMembersAutocompletionsArguments, User } from 'shared'

export async function getGroupMembersAutocompletions(
  pool: Pool,
  callerId: string,
  args: GetGroupMembersAutocompletionsArguments
): Promise<User[]> {
  const hasAccess = (
    await pool.query('SELECT has_access FROM group_members WHERE group_id = $1 AND user_id = $2', [
      args.groupId,
      callerId,
    ])
  ).rows[0]?.has_access

  if (!hasAccess) {
    throw new Error('You do not have permission to restore splits in this group')
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
    photoURL: row.photo_url,
  }))
}
