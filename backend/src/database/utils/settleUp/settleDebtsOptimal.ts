import { Transaction } from './types'
import currency from 'currency.js'
import { Member } from 'shared'

export function settleDebtsOptimal(users: Member[]): Transaction[] {
  const zipped = users
    .filter((u) => currency(u.balance).value !== 0)
    .map((u) => [u.id, currency(u.balance)] as [string, currency])

  // Sort balances for early convergence
  zipped.sort((a, b) => a[1].value - b[1].value)

  const userIds = zipped.map(([id]) => id)
  const balances = zipped.map(([_, bal]) => bal)

  const n = balances.length
  const bestTransactions: Transaction[] = []
  const memo = new Map<string, number>()

  function solve(currentBalances: currency[], transactions: Transaction[]): number {
    // Find first non-zero balance
    let start = 0
    while (start < n && currentBalances[start].intValue === 0) start++

    if (start === n) {
      // All balances are zero - we found a complete solution
      if (bestTransactions.length === 0 || transactions.length < bestTransactions.length) {
        bestTransactions.length = 0
        bestTransactions.push(...transactions)
      }
      return 0
    }

    // Use memoization based on current state
    const key = currentBalances.map((b) => b.value).join(',')
    if (memo.has(key)) return memo.get(key)!

    let minTransactions = Infinity

    // Find someone to settle with
    for (let i = start + 1; i < n; i++) {
      if (currentBalances[start].intValue * currentBalances[i].intValue < 0) {
        // Found a valid pair - create transaction
        const amount =
          Math.abs(currentBalances[start].intValue) > Math.abs(currentBalances[i].intValue)
            ? Math.abs(currentBalances[i].value)
            : Math.abs(currentBalances[start].value)

        const from = currentBalances[start].intValue < 0 ? start : i
        const to = currentBalances[start].intValue < 0 ? i : start

        // Create new balances array for recursion
        const newBalances = currentBalances.map((b) => currency(b.value))

        // Update balances
        if (currentBalances[start].intValue < 0) {
          // start owes money, i is owed money
          newBalances[start] = newBalances[start].add(amount)
          newBalances[i] = newBalances[i].subtract(amount)
        } else {
          // start is owed money, i owes money
          newBalances[start] = newBalances[start].subtract(amount)
          newBalances[i] = newBalances[i].add(amount)
        }

        const newTransaction = {
          from: userIds[from],
          to: userIds[to],
          amount: amount.toFixed(2),
        }

        // Recurse with new state
        const remainingTransactions = solve(newBalances, [...transactions, newTransaction])
        minTransactions = Math.min(minTransactions, 1 + remainingTransactions)
      }
    }

    memo.set(key, minTransactions)
    return minTransactions
  }

  solve(balances, [])
  return bestTransactions
}
