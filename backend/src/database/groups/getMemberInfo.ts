import { NotFoundException } from '../../errors/NotFoundException'
import { getMemberPermissions } from '../utils/getMemberPermissions'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMemberInfoArguments, MemberWithClaimCode } from 'shared'

export async function getMemberInfo(
  pool: Pool,
  callerId: string,
  args: GetGroupMemberInfoArguments
): Promise<MemberWithClaimCode> {
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
          users.is_ghost,
          users.picture_id,
          group_members.balance,
          group_members.has_access,
          group_members.is_admin,
          group_members.display_name,
          ghost_users.claim_code
        FROM group_members 
        JOIN users ON group_members.user_id = users.id 
        LEFT JOIN ghost_users ON ghost_users.id = users.id AND ghost_users.group_id = group_members.group_id
        WHERE group_members.group_id = $1 AND users.id = $2 
      `,
      [args.groupId, args.memberId ?? '']
    )
  ).rows

  if (rows.length === 0) {
    throw new NotFoundException('api.group.userNotInGroup')
  }

  let claimCode: string | null = null
  if (rows[0].is_ghost && rows[0].claim_code) {
    const permissions = await getMemberPermissions(pool, args.groupId, callerId)
    if (permissions?.canManageGhosts()) {
      claimCode = rows[0].claim_code
    }
  }

  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    deleted: rows[0].deleted,
    isGhost: rows[0].is_ghost,
    pictureId: rows[0].picture_id,
    balance: rows[0].balance,
    hasAccess: rows[0].has_access,
    isAdmin: rows[0].is_admin,
    displayName: rows[0].display_name,
    claimCode,
  }
}
