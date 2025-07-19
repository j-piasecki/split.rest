import { Transaction } from './types'
import currency from 'currency.js'
import { Member } from 'shared'

export function settleDebtsFast(users: Member[]): Transaction[] {
  const creditors: { id: string; balance: ReturnType<typeof currency> }[] = []
  const debtors: { id: string; balance: ReturnType<typeof currency> }[] = []

  for (const user of users) {
    if (Number(user.balance) > 0) {
      creditors.push({ id: user.id, balance: currency(user.balance) })
    } else if (Number(user.balance) < 0) {
      debtors.push({ id: user.id, balance: currency(user.balance) })
    }
  }

  const transactions: Transaction[] = []

  let i = 0,
    j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount =
      -debtor.balance.intValue < creditor.balance.intValue
        ? debtor.balance.multiply(-1)
        : creditor.balance

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount: amount.toString(),
    })

    debtor.balance = debtor.balance.add(amount)
    creditor.balance = creditor.balance.subtract(amount)

    if (debtor.balance.intValue === 0) i++
    if (creditor.balance.intValue === 0) j++
  }

  return transactions
}
