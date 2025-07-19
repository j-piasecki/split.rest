import { settleDebtsFast } from './settleDebtsFast'
import { settleDebtsOptimal } from './settleDebtsOptimal'
import { Transaction } from './types'
import currency from 'currency.js'
import { Member } from 'shared'

export function extractPerfectMatches(users: Member[]): {
  transactions: Transaction[]
  remainingUsers: Member[]
} {
  const debtors: Member[] = []
  const creditorsMap = new Map<number, Member[]>()
  const transactions: Transaction[] = []

  // Separate users by sign
  for (const user of users) {
    if (currency(user.balance).intValue < 0) {
      debtors.push(user)
    } else if (currency(user.balance).intValue > 0) {
      if (!creditorsMap.has(currency(user.balance).intValue)) {
        creditorsMap.set(currency(user.balance).intValue, [])
      }
      creditorsMap.get(currency(user.balance).intValue)!.push(user)
    }
  }

  const settledDebtors = new Set<string>()
  const settledCreditors = new Set<string>()

  for (const debtor of debtors) {
    const match = creditorsMap.get(-currency(debtor.balance).intValue)
    if (match && match.length > 0) {
      const creditor = match.pop()!
      settledDebtors.add(debtor.id)
      settledCreditors.add(creditor.id)

      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: currency(debtor.balance).multiply(-1).toString(),
      })

      if (match.length === 0) {
        creditorsMap.delete(-currency(debtor.balance).intValue)
      }
    }
  }

  const remainingUsers = users.filter(
    (u) => !settledDebtors.has(u.id) && !settledCreditors.has(u.id)
  )

  return {
    transactions,
    remainingUsers,
  }
}

export function settleDebts(users: Member[]): Transaction[] {
  // Resolve perfect matches first
  const { transactions: perfectMatches, remainingUsers } = extractPerfectMatches(users)

  const transactions =
    remainingUsers.length > 10
      ? settleDebtsFast(remainingUsers)
      : settleDebtsOptimal(remainingUsers)

  return [...perfectMatches, ...transactions]
}
