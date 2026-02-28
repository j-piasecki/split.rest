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
          split_participants.pending, 
          users.name, 
          users.email, 
          users.deleted,
          users.picture_id,
          group_members.balance,
          group_members.has_access,
          group_members.is_admin,
          group_members.display_name
        FROM users
          INNER JOIN split_participants ON users.id = split_participants.user_id
          INNER JOIN group_members ON users.id = group_members.user_id
        WHERE 
          split_id = $1 AND group_id = $2
      `,
      [args.splitId, args.groupId]
    )
  ).rows

  const isParticipating = await isUserMemberOfSplit(pool, args.splitId, callerId)
  const isPending = participants.some((p) => p.pending)

  return {
    id: splitRow.id,
    title: splitRow.name,
    total: splitRow.total,
    timestamp: Number(splitRow.timestamp),
    paidBy: participants.find((p) => p.id === splitRow.paid_by)!,
    createdById: splitRow.created_by,
    version: splitRow.version,
    updatedAt: Number(splitRow.updated_at),
    type: splitRow.type,
    isUserParticipating: isParticipating,
    pending: isPending,
    users: participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      change: p.change,
      pending: p.pending,
      deleted: p.deleted,
      balance: p.balance,
      hasAccess: p.has_access,
      isAdmin: p.is_admin,
      displayName: p.display_name,
      pictureId: p.picture_id,
    })),
  }
}
