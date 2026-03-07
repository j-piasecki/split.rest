import { NotFoundException } from '../../errors/NotFoundException'
import { queryGroupSplits } from './queryGroupSplits'
import { Pool } from 'pg'
import { GetGroupInviteByClaimCodeArguments, GroupInviteByClaimCodeResponse } from 'shared'

export async function getGroupInviteByClaimCode(
  pool: Pool,
  callerId: string,
  args: GetGroupInviteByClaimCodeArguments
): Promise<GroupInviteByClaimCodeResponse> {
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
        groups.last_update as group_last_update,
        groups.locked as group_locked,
        groups.icon as group_icon,
        users.id as inviter_id,
        users.name as inviter_name,
        users.email as inviter_email,
        users.deleted as inviter_deleted,
        users.picture_id as inviter_picture_id,
        ghost_users.id as ghost_id,
        groups.created_at as created_at,
        group_members.balance as ghost_balance
      FROM ghost_users
      JOIN groups ON groups.id = ghost_users.group_id
      JOIN users ON users.id = ghost_users.created_by
      JOIN group_members ON group_members.user_id = ghost_users.id AND group_members.group_id = ghost_users.group_id
      WHERE ghost_users.claim_code = $1
        AND groups.deleted = false
    `,
    [args.claimCode]
  )

  if (rows.length === 0) {
    throw new NotFoundException('api.group.invalidClaimCode')
  }

  const groupId = rows[0].group_id
  const ghostId = rows[0].ghost_id

  const { rows: groupMemberIds } = await pool.query<{ user_id: string; picture_id: string }>(
    `
      SELECT
        users.id as user_id,
        users.picture_id as picture_id
      FROM group_members INNER JOIN users ON users.id = group_members.user_id
      WHERE group_id = $1
      ORDER BY user_id
      LIMIT 20
    `,
    [groupId]
  )

  const { rows: alreadyAMember } = await pool.query<{ user_id: string }>(
    `
      SELECT user_id
      FROM group_members
      WHERE group_id = $1 AND user_id = $2
    `,
    [groupId, callerId]
  )

  const invite = {
    groupInfo: {
      id: groupId,
      name: rows[0].group_name,
      owner: rows[0].group_owner,
      currency: rows[0].group_currency,
      memberCount: rows[0].group_member_count,
      // don't leave access to total amount before joining
      total: '-1',
      type: rows[0].group_type,
      lastUpdate: Number(rows[0].group_last_update),
      locked: rows[0].group_locked,
      icon: rows[0].group_icon,
    },
    createdBy: {
      id: rows[0].inviter_id,
      name: rows[0].inviter_name,
      email: rows[0].inviter_email,
      deleted: rows[0].inviter_deleted,
      pictureId: rows[0].inviter_picture_id,
    },
    memberIds: groupMemberIds.map((row) => row.user_id),
    profilePictures: groupMemberIds.map((row) => row.picture_id),
    createdAt: Number(rows[0].created_at),
    rejected: false,
    withdrawn: false,
    alreadyAMember: alreadyAMember.length > 0,
  }

  const splits = await queryGroupSplits(pool, ghostId, {
    groupId,
    query: {
      participants: { type: 'oneOf', ids: [ghostId] },
    },
  })

  return { invite, splits, balance: rows[0].ghost_balance as string }
}
