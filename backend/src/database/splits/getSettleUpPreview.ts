import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { loadSettleUpData, prepareSettleUp } from '../utils/settleUp'
import hash from 'object-hash'
import { Pool } from 'pg'
import { SettleUpArguments, SplitType, SplitWithHashedChanges } from 'shared'

export async function getSettleUpPreview(
  pool: Pool,
  callerId: string,
  args: SettleUpArguments
): Promise<SplitWithHashedChanges> {
  const client = await pool.connect()

  try {
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

    const settleUpData = await loadSettleUpData(client, args.groupId)
    const entries = prepareSettleUp(
      callerId,
      balance,
      settleUpData.members,
      settleUpData.pendingChanges,
      args.withMembers
    )

    if (entries.length === 1) {
      throw new BadRequestException('api.split.settledUpButPending')
    }

    const entriesHash = hash(entries, { algorithm: 'sha1', encoding: 'base64' })
    const total = entries.reduce((acc, entry) => acc + Number(entry.change), 0)
    const splitType = SplitType.SettleUp | (total > 0 ? SplitType.Inversed : SplitType.Normal)

    return {
      id: -1,
      version: 1,
      total: Math.abs(total).toFixed(2),
      paidById: callerId,
      createdById: callerId,
      title: 'Settle up',
      timestamp: Date.now(),
      updatedAt: Date.now(),
      isUserParticipating: true,
      type: splitType,
      pending: true,
      entriesHash: entriesHash,
      users: entries.map((entry) => {
        const member = settleUpData.members.find((m) => m.id === entry.id)!
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
  } finally {
    client.release()
  }
}
