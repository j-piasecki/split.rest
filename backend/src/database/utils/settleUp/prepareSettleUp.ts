import { TargetedBalanceChange } from './types'
import assert from 'assert'
import currency from 'currency.js'
import { BalanceChange, Member } from 'shared'

export function prepareSettleUp(
  payerId: string,
  balance: number,
  allMembers: Member[],
  pendingChanges: TargetedBalanceChange[],
  withMembers?: string[],
  amounts?: string[]
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

    if (amounts !== undefined) {
      assert(amounts.length === 1)
      const providedAmount = currency(amounts[0])

      if (providedAmount.intValue !== 0) {
        entries.push({ id: member.id, change: providedAmount.toString(), pending: true })
        return entries
      }
    }

    if (balance !== 0) {
      entries.push({ id: member.id, change: currency(balance).toString(), pending: true })
    }

    return entries
  }

  // This should result in a list of members with the opposite sign of the balance
  // grouped by whether they have access or not and sorted by balance descending.
  const members = allMembers
    .filter((member) => {
      return Math.sign(currency(member.balance).intValue) === -Math.sign(balance)
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

      const balanceA = currency(a.balance).intValue
      const balanceB = currency(b.balance).intValue

      // If both users have access sort by absolute balance (sorts positive descending and negatives ascending)
      return Math.abs(balanceB) - Math.abs(balanceA)
    })

  let workingBalance = currency(balance)

  for (const member of members) {
    const memberBalance = currency(member.balance)
    assert(Math.sign(memberBalance.intValue) === -Math.sign(balance))

    if (balance < 0) {
      if (workingBalance.add(memberBalance).intValue >= 0) {
        entries.push({
          id: member.id,
          change: currency(workingBalance).toString(),
          pending: true,
        })
        workingBalance = currency(0)
      } else {
        entries.push({
          id: member.id,
          change: currency(-memberBalance).toString(),
          pending: true,
        })
        workingBalance = workingBalance.add(memberBalance)
      }

      if (workingBalance.intValue >= 0) {
        break
      }
    } else if (balance > 0) {
      if (workingBalance.add(memberBalance).intValue <= 0) {
        entries.push({
          id: member.id,
          change: currency(workingBalance).toString(),
          pending: true,
        })
        workingBalance = currency(0)
      } else {
        entries.push({
          id: member.id,
          change: currency(-memberBalance).toString(),
          pending: true,
        })
        workingBalance = workingBalance.add(memberBalance)
      }

      if (workingBalance.intValue <= 0) {
        break
      }
    }
  }

  assert(workingBalance.intValue === 0)
  return entries
}
