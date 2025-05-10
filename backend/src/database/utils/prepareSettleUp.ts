import assert from 'assert'
import pg from 'pg'
import { BalanceChange, Member } from 'shared'

export interface TargetedBalanceChange extends BalanceChange {
  targetId: string
}

export async function loadSettleUpData(client: pg.Client | pg.PoolClient, groupId: number) {
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
      [groupId]
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

  const pendingChanges: TargetedBalanceChange[] = (
    await client.query(
      `
        SELECT 
          user_id,
          change,
          pending,
          splits.paid_by AS target_user_id
        FROM split_participants INNER JOIN splits ON split_participants.split_id = splits.id
        WHERE group_id = $1 AND pending = TRUE AND deleted = FALSE
      `,
      [groupId]
    )
  ).rows.map((row) => ({
    id: row.user_id,
    targetId: row.target_user_id,
    change: row.change,
    pending: row.pending,
  }))

  return {
    members: members,
    pendingChanges: pendingChanges,
  }
}

export function prepareSettleUp(
  payerId: string,
  balance: number,
  allMembers: Member[],
  pendingChanges: TargetedBalanceChange[],
  withMembers?: string[]
): BalanceChange[] {
  // TODO: Better algorithm for this
  const entries: BalanceChange[] = [{ id: payerId, change: '0.00', pending: false }]

  pendingChanges.forEach((change) => {
    const member = allMembers.find((m) => m.id === change.id)
    const targetMember = allMembers.find((m) => m.id === change.targetId)

    if (member && targetMember) {
      member.balance = (Number(member.balance) + Number(change.change)).toFixed(2)
      targetMember.balance = (Number(targetMember.balance) - Number(change.change)).toFixed(2)

      if (member.id === payerId) {
        balance = Number(member.balance)
      }
      if (targetMember.id === payerId) {
        balance = Number(targetMember.balance)
      }
    }
  })

  if (withMembers !== undefined) {
    // TODO: add support for full subgroup settle up (only one on one settle up for now)
    assert(withMembers.length === 1)

    const member = allMembers.find((m) => m.id === withMembers[0])
    assert(member !== undefined)

    entries.push({ id: member.id, change: balance.toFixed(2), pending: true })
    return entries
  }

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

  for (const member of members) {
    const memberBalance = Number(member.balance)
    assert(Math.sign(memberBalance) === -Math.sign(balance))

    if (balance < 0) {
      if (workingBalance + memberBalance >= 0) {
        entries.push({
          id: member.id,
          change: workingBalance.toFixed(2),
          pending: true,
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: (-memberBalance).toFixed(2),
          pending: true,
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
          pending: true,
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: (-memberBalance).toFixed(2),
          pending: true,
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
