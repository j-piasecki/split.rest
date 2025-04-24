import assert from 'assert'
import { BalanceChange, Member } from 'shared'

export interface TargetedBalanceChange extends BalanceChange {
  targetId: string
}

export function prepareSettleUp(
  payerId: string,
  balance: number,
  allMembers: Member[],
  pendingChanges: TargetedBalanceChange[]
): BalanceChange[] {
  // TODO: Better algorithm for this

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
  const entries: BalanceChange[] = [{ id: payerId, change: (-balance).toFixed(2), pending: true }]

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
