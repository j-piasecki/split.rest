import { Transaction } from './types'
import currency from 'currency.js'
import { Member } from 'shared'

export function settleDebtsOptimal(users: Member[]): Transaction[] {
  const balances: ReturnType<typeof currency>[] = []
  const userIds: string[] = []

  for (const user of users) {
    balances.push(currency(user.balance))
    userIds.push(user.id)
  }

  const n = balances.length
  const transactions: Transaction[] = []
  const bestTransactions: Transaction[] = []
  const memo = new Map<string, number>()

  function dfs(start: number): number {
    while (start < n && balances[start].intValue === 0) start++
    if (start === n) {
      if (bestTransactions.length === 0 || transactions.length < bestTransactions.length) {
        bestTransactions.length = 0
        bestTransactions.push(...transactions)
      }
      return 0
    }

    const key = balances.join(',')
    if (memo.has(key)) return memo.get(key)!

    let minTx = Infinity

    for (let i = start + 1; i < n; i++) {
      if (balances[start].intValue * balances[i].intValue < 0) {
        const amount =
          Math.abs(balances[start].intValue) > Math.abs(balances[i].intValue)
            ? balances[i]
            : balances[start]
        const from = balances[start].intValue < 0 ? start : i
        const to = balances[start].intValue < 0 ? i : start

        balances[i] = balances[i].add(balances[start])
        transactions.push({
          from: userIds[from],
          to: userIds[to],
          amount: Math.abs(amount.value).toFixed(2),
        })

        minTx = Math.min(minTx, 1 + dfs(start + 1))

        transactions.pop()
        balances[i] = balances[i].subtract(balances[start])

        if (balances[i].add(balances[start]).intValue === 0) break
      }
    }

    memo.set(key, minTx)
    return minTx
  }

  dfs(0)
  return bestTransactions
}
