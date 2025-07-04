import { Pool } from 'pg'
import { GetUserInvitesArguments, GroupInviteWithGroupInfo } from 'shared'

export async function getUserGroupInvites(
  pool: Pool,
  callerId: string,
  args: GetUserInvitesArguments
): Promise<GroupInviteWithGroupInfo[]> {
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
          groups.last_update,
          users.id AS inviter_id,
          users.name AS inviter_name,
          users.email AS inviter_email,
          users.deleted AS inviter_deleted,
          group_invites.created_at,
          group_invites.rejected
        FROM groups JOIN group_invites ON groups.id = group_invites.group_id JOIN users ON users.id = group_invites.created_by
        WHERE group_invites.user_id = $1 AND group_invites.rejected = $2 AND group_invites.withdrawn = FALSE AND group_invites.created_at < $3 AND groups.deleted = FALSE
        ORDER BY
          groups.id DESC
        LIMIT 20;
      `,
      [callerId, args.rejected, args.startAfter ?? Number.MAX_SAFE_INTEGER]
    )
  ).rows

  return rows.map((row) => ({
    createdBy: {
      id: row.inviter_id,
      name: row.inviter_name,
      email: row.inviter_email,
      photoUrl: null,
      deleted: row.inviter_deleted,
    },
    groupInfo: {
      id: row.id,
      name: row.name,
      currency: row.currency,
      owner: row.owner,
      total: row.total,
      memberCount: row.member_count,
      type: row.type,
      lastUpdate: Number(row.last_update),
    },
    createdAt: Number(row.created_at),
    rejected: row.rejected,
    withdrawn: false,
    alreadyAMember: false, // the invite should be deleted when joining the group
  }))
}
