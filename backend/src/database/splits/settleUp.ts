import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { createSplitNoTransaction } from './createSplit'
import assert from 'assert'
import { Pool, PoolClient } from 'pg'
import { BalanceChange, Member, SettleUpArguments, SplitInfo, SplitType } from 'shared'

export function calculateSettleUpEntries(
  payerId: string,
  balance: number,
  allMembers: Member[]
): BalanceChange[] {
  // TODO: Better algorithm for this

  // This should result in a list of members with the opposite sign of the balance
  // grouped by whether they have access or not and sorted by balance descending.
  const members = allMembers
    .filter((member) => {
      return Math.sign(Number(member.balance)) === -Math.sign(balance)
    })
    .sort((a, b) => {
      // Keep deleted users at the end
      if (a.deleted && !b.deleted) {
        return 1
      } else if (!a.deleted && b.deleted) {
        return -1
      }

      // Keep users with access at the beginning
      if (a.hasAccess && !b.hasAccess) {
        return -1
      } else if (!a.hasAccess && b.hasAccess) {
        return 1
      }

      const balanceA = Number(a.balance)
      const balanceB = Number(b.balance)

      // If both users have access sort by absolute balance (sorts positive descending and negatives ascending)
      return Math.abs(balanceB) - Math.abs(balanceA)
    })

  let workingBalance = balance
  const entries: BalanceChange[] = [{ id: payerId, change: (-balance).toFixed(2) }]

  for (const member of members) {
    const memberBalance = Number(member.balance)
    assert(Math.sign(memberBalance) === -Math.sign(balance))

    if (balance < 0) {
      if (workingBalance + memberBalance >= 0) {
        entries.push({
          id: member.id,
          change: workingBalance.toFixed(2),
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: (-memberBalance).toFixed(2),
        })
        workingBalance += memberBalance
      }

      if (workingBalance >= 0) {
        break
      }
    } else if (balance > 0) {
      if (workingBalance + memberBalance <= 0) {
        entries.push({
          id: member.id,
          change: workingBalance.toFixed(2),
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: (-memberBalance).toFixed(2),
        })
        workingBalance += memberBalance
      }

      if (workingBalance <= 0) {
        break
      }
    }
  }

  assert(workingBalance === 0)
  return entries
}

async function createAndSaveSettleUpSplit(
  client: PoolClient,
  callerId: string,
  balance: number,
  members: Member[],
  groupId: number
): Promise<SplitInfo> {
  const entries = calculateSettleUpEntries(callerId, balance, members)
  const splitType = SplitType.SettleUp | (balance > 0 ? SplitType.Inversed : SplitType.Normal)

  const splitId = await createSplitNoTransaction(client, callerId, {
    groupId: groupId,
    total: Math.abs(balance).toFixed(2),
    paidBy: callerId,
    title: 'Settle up',
    timestamp: Date.now(),
    balances: entries,
    type: splitType,
  })

  return {
    id: splitId,
    version: 1,
    total: Math.abs(balance).toFixed(2),
    paidById: callerId,
    createdById: callerId,
    title: 'Settle up',
    timestamp: Date.now(),
    updatedAt: Date.now(),
    isUserParticipating: true,
    type: splitType,
  }
}

export async function settleUp(
  pool: Pool,
  callerId: string,
  args: SettleUpArguments
): Promise<SplitInfo> {
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

    const split = await createAndSaveSettleUpSplit(client, callerId, balance, members, args.groupId)

    await client.query('COMMIT')

    return split
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
