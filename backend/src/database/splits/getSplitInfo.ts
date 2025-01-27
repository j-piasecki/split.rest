import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfSplit } from '../utils/isUserMemberOfSplit'
import { Pool } from 'pg'
import { GetSplitInfoArguments, SplitWithUsers } from 'shared'

export async function getSplitInfo(
  pool: Pool,
  callerId: string,
  args: GetSplitInfoArguments
): Promise<SplitWithUsers> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const splitRow = (
    await pool.query(
      'SELECT id, name, total, paid_by, created_by, timestamp, deleted, version, updated_at, type FROM splits WHERE group_id = $1 AND id = $2',
      [args.groupId, args.splitId]
    )
  ).rows[0]

  if (!splitRow || splitRow.deleted) {
    throw new NotFoundException('api.notFound.split')
  }

  const participants = (
    await pool.query(
      `
        SELECT 
          users.id, 
          split_participants.change, 
          users.name, 
          users.email, 
          users.deleted 
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

  const isParticipating = await isUserMemberOfSplit(pool, args.splitId, callerId)

  return {
    id: splitRow.id,
    title: splitRow.name,
    total: splitRow.total,
    timestamp: Number(splitRow.timestamp),
    paidById: splitRow.paid_by,
    createdById: splitRow.created_by,
    version: splitRow.version,
    updatedAt: Number(splitRow.updated_at),
    type: splitRow.type,
    isUserParticipating: isParticipating,
    users: participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      photoUrl: null,
      change: p.change,
      deleted: p.deleted,
    })),
  }
}
