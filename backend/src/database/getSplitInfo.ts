import { hasAccessToGroup } from './utils/hasAccessToGroup'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { GetSplitInfoArguments, SplitWithUsers } from 'shared'

export async function getSplitInfo(
  pool: Pool,
  callerId: string,
  args: GetSplitInfoArguments
): Promise<SplitWithUsers> {
  // TODO: allow to see split if user has no access but is a participant?
  if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
    throw new UnauthorizedException('You do not have permission to see this split')
  }

  const splitRow = (
    await pool.query(
      'SELECT id, name, total, paid_by, created_by, timestamp, deleted FROM splits WHERE group_id = $1 AND id = $2',
      [args.groupId, args.splitId]
    )
  ).rows[0]

  if (!splitRow || splitRow.deleted) {
    throw new NotFoundException('Split not found')
  }

  const participants = (
    await pool.query(
      `
        SELECT 
          users.id, 
          split_participants.change, 
          users.name, 
          users.email, 
          users.photo_url 
        FROM 
          users 
        INNER JOIN 
          split_participants 
        ON 
          users.id = split_participants.user_id 
        WHERE 
          split_id = $1
      `,
      [args.splitId]
    )
  ).rows

  return {
    id: splitRow.id,
    title: splitRow.name,
    total: splitRow.total,
    timestamp: Number(splitRow.timestamp),
    paidById: splitRow.paid_by,
    createdById: splitRow.created_by,
    users: participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      photoUrl: p.photo_url,
      change: p.change,
    })),
  }
}
