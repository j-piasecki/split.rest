import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetDirectGroupInvitesArguments, GroupInviteWithInvitee } from 'shared'

// TODO: arbitrarily returns only the invites that were not withdrawn.
// depending if needed, this could be easily be changed to return all invites
// which would allow for a more complete view.
// Though, at the moment accepting a withdrawn invite permamently deletes it,
// so there may be little value in showing them.
export async function getDirectGroupInvites(
  pool: Pool,
  callerId: string,
  args: GetDirectGroupInvitesArguments
): Promise<GroupInviteWithInvitee[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    await pool.query(
      `
        SELECT 
          inviter.id AS inviter_id,
          inviter.name AS inviter_name,
          inviter.email AS inviter_email,
          inviter.deleted AS inviter_deleted,
          invitee.id AS invitee_id,
          invitee.name AS invitee_name,
          invitee.email AS invitee_email,
          invitee.deleted AS invitee_deleted,
          group_invites.created_at,
          group_invites.rejected,
          group_invites.withdrawn
        FROM group_invites JOIN users AS inviter ON inviter.id = group_invites.created_by JOIN users AS invitee ON invitee.id = group_invites.user_id
        WHERE group_invites.group_id = $1 AND group_invites.withdrawn = FALSE AND group_invites.created_at < $2 ${args.onlyIfCreated ? 'AND group_invites.created_by = $3' : ''}
        ORDER BY
          group_invites.created_at DESC
        LIMIT 20;
      `,
      args.onlyIfCreated
        ? [args.groupId, args.startAfter ?? Number.MAX_SAFE_INTEGER, callerId]
        : [args.groupId, args.startAfter ?? Number.MAX_SAFE_INTEGER]
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
    invitee: {
      id: row.invitee_id,
      name: row.invitee_name,
      email: row.invitee_email,
      photoUrl: null,
      deleted: row.invitee_deleted,
    },
    createdAt: Number(row.created_at),
    rejected: row.rejected,
    withdrawn: row.withdrawn,
  }))
}
