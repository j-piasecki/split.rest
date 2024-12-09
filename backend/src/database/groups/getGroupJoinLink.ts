import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetGroupJoinLinkArguments } from 'shared/src/endpointArguments'
import { GroupJoinLink } from 'shared/src/types'

export async function getGroupJoinLink(
  pool: Pool,
  callerId: string,
  args: GetGroupJoinLinkArguments
): Promise<GroupJoinLink> {
  if (!(await isUserGroupAdmin(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('You do not have permission to get a join link')
  }

  const { rows } = await pool.query(
    'SELECT uuid, group_id, created_by, created_at FROM group_join_links WHERE group_id = $1',
    [args.groupId]
  )

  if (rows.length === 0) {
    throw new NotFoundException('No join link found for this group')
  }

  return {
    uuid: rows[0].uuid,
    groupId: rows[0].group_id,
    createdById: rows[0].created_by,
    createdAt: rows[0].created_at,
  }
}
