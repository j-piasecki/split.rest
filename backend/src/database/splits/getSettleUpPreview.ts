import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { calculateSettleUpEntries } from './settleUp'
import hash from 'object-hash'
import { Pool } from 'pg'
import { Member, SettleUpArguments, SplitType, SplitWithHashedChanges } from 'shared'

export async function getSettleUpPreview(
  pool: Pool,
  callerId: string,
  args: SettleUpArguments
): Promise<SplitWithHashedChanges> {
  const client = await pool.connect()

  if (await isGroupDeleted(client, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  if (!(await isUserMemberOfGroup(client, args.groupId, callerId))) {
    throw new NotFoundException('api.notFound.group')
  }

  const balance = Number(
    (
      await client.query<{ balance: string }>(
        `SELECT balance from group_members WHERE group_id = $1 AND user_id = $2`,
        [args.groupId, callerId]
      )
    ).rows[0].balance
  )

  if (balance === 0) {
    throw new BadRequestException('api.split.cannotSettleUpNeutral')
  }

  const splitType = SplitType.SettleUp | (balance > 0 ? SplitType.Inversed : SplitType.Normal)

  const members: Member[] = (
    await client.query(
      `
          SELECT 
            users.id,
            users.name,
            users.email, 
            users.deleted,
            group_members.balance,
            group_members.has_access,
            group_members.is_admin,
            group_members.display_name
          FROM group_members 
          JOIN users ON group_members.user_id = users.id 
          WHERE group_id = $1 
          ORDER BY users.id 
        `,
      [args.groupId]
    )
  ).rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: null,
    deleted: row.deleted,
    balance: row.balance,
    hasAccess: row.has_access,
    isAdmin: row.is_admin,
    displayName: row.display_name,
  }))

  const entries = calculateSettleUpEntries(callerId, balance, members)
  const entriesHash = hash(entries, { algorithm: 'sha1', encoding: 'base64' })

  return {
    id: -1,
    version: 1,
    total: Math.abs(balance).toFixed(2),
    paidById: callerId,
    createdById: callerId,
    title: 'Settle up',
    timestamp: Date.now(),
    updatedAt: Date.now(),
    isUserParticipating: true,
    type: splitType,
    pending: false,
    entriesHash: entriesHash,
    users: entries.map((entry) => {
      const member = members.find((m) => m.id === entry.id)!
      return {
        id: entry.id,
        name: member.name,
        email: member.email,
        photoUrl: member.photoUrl,
        deleted: member.deleted,
        change: entry.change,
        pending: entry.pending,
        displayName: member.displayName,
      }
    }),
  }
}
