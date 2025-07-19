import { TargetedBalanceChange } from './types'
import assert from 'assert'
import currency from 'currency.js'
import { BalanceChange, Member } from 'shared'

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
      member.balance = currency(member.balance).add(change.change).toString()
      targetMember.balance = currency(targetMember.balance).subtract(change.change).toString()

      if (member.id === payerId) {
        balance = currency(member.balance).value
      }
      if (targetMember.id === payerId) {
        balance = currency(targetMember.balance).value
      }
    }
  })

  if (withMembers !== undefined) {
    // TODO: add support for full subgroup settle up (only one on one settle up for now)
    assert(withMembers.length === 1)

    const member = allMembers.find((m) => m.id === withMembers[0])
    assert(member !== undefined)

    if (balance !== 0) {
      entries.push({ id: member.id, change: currency(balance).toString(), pending: true })
    }

    return entries
  }

  // This should result in a list of members with the opposite sign of the balance
  // grouped by whether they have access or not and sorted by balance descending.
  const members = allMembers
    .filter((member) => {
      return Math.sign(currency(member.balance).value) === -Math.sign(balance)
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

      const balanceA = currency(a.balance).value
      const balanceB = currency(b.balance).value

      // If both users have access sort by absolute balance (sorts positive descending and negatives ascending)
      return Math.abs(balanceB) - Math.abs(balanceA)
    })

  let workingBalance = balance

  for (const member of members) {
    const memberBalance = currency(member.balance).value
    assert(Math.sign(memberBalance) === -Math.sign(balance))

    if (balance < 0) {
      if (workingBalance + memberBalance >= 0) {
        entries.push({
          id: member.id,
          change: currency(workingBalance).toString(),
          pending: true,
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: currency(-memberBalance).toString(),
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
          change: currency(workingBalance).toString(),
          pending: true,
        })
        workingBalance = 0
      } else {
        entries.push({
          id: member.id,
          change: currency(-memberBalance).toString(),
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
