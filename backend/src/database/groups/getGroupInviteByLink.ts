import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { GroupInvite } from 'shared'
import { GetGroupInviteByLinkArguments } from 'shared/src/endpointArguments'

export async function getGroupInviteByLink(
  pool: Pool,
  args: GetGroupInviteByLinkArguments
): Promise<GroupInvite> {
  const { rows } = await pool.query(
    `
      SELECT 
        groups.id as group_id,
        groups.name as group_name,
        groups.owner as group_owner,
        groups.currency as group_currency,
        groups.deleted as group_deleted,
        groups.member_count as group_member_count,
        groups.type as group_type,
        group_join_links.created_at as created_at,
        users.id as inviter_id,
        users.name as inviter_name,
        users.email as inviter_email,
        users.deleted as inviter_deleted
      FROM
        groups 
      JOIN group_join_links ON groups.id = group_join_links.group_id
      JOIN users ON users.id = group_join_links.created_by
      WHERE
        group_join_links.uuid = $1
        AND groups.deleted = false
    `,
    [args.uuid]
  )

  if (rows.length === 0) {
    throw new NotFoundException('api.notFound.group')
  }

  return {
    groupInfo: {
      id: rows[0].group_id,
      name: rows[0].group_name,
      owner: rows[0].group_owner,
      currency: rows[0].group_currency,
      memberCount: rows[0].group_member_count,
      // don't gove access to total amount before joining
      total: '-1',
      type: rows[0].group_type,
    },
    createdBy: {
      id: rows[0].inviter_id,
      name: rows[0].inviter_name,
      email: rows[0].inviter_email,
      photoUrl: null,
      deleted: rows[0].inviter_deleted,
    },
    createdAt: rows[0].created_at,
    rejected: false,
    withdrawn: false,
  }
}
