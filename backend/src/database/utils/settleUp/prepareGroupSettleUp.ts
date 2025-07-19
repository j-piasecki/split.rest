import { settleDebts } from './settleDebts'
import { GroupedSettlement, TargetedBalanceChange } from './types'
import currency from 'currency.js'
import { Member } from 'shared'

export function prepareGroupSettleUp(
  allMembers: Member[],
  pendingChanges: TargetedBalanceChange[]
): GroupedSettlement[] {
  // Apply pending changes to members
  pendingChanges.forEach((change) => {
    const member = allMembers.find((m) => m.id === change.id)
    const targetMember = allMembers.find((m) => m.id === change.targetId)

    if (member && targetMember) {
      member.balance = currency(member.balance).add(change.change).toString()
      targetMember.balance = currency(targetMember.balance).subtract(change.change).toString()
    }
  })

  // Filter out already balanced members
  const members = allMembers.filter((m) => Number(m.balance) !== 0)
  const transactions = settleDebts(members)

  // Group transactions by target (recipient)
  const groupedByTarget = new Map<string, Array<{ from: string; amount: string }>>()

  transactions.forEach((transaction) => {
    if (!groupedByTarget.has(transaction.to)) {
      groupedByTarget.set(transaction.to, [])
    }
    groupedByTarget.get(transaction.to)!.push({
      from: transaction.from,
      amount: transaction.amount,
    })
  })

  // Convert to array format with target and transactions
  return Array.from(groupedByTarget.entries()).map(([targetId, payments]) => ({
    targetId,
    payments,
  }))
}
