import { settleDebtsFast } from '../database/utils/settleUp/settleDebtsFast'
import { settleDebtsOptimal } from '../database/utils/settleUp/settleDebtsOptimal'
import currency from 'currency.js'
import { Member } from 'shared'
import { Transaction } from 'src/database/utils/settleUp/types'

function createMember(id: string, balance: string, hasAccess: boolean, deleted: boolean): Member {
  return {
    id,
    balance,
    hasAccess,
    deleted,
    isAdmin: false,
    email: `user_${id}@email.com`,
    name: `User ${id}`,
    photoUrl: '',
    displayName: null,
  }
}

function verifyTransactions(members: Member[], transactions: Transaction[]) {
  transactions.forEach((transaction) => {
    members.find((m) => m.id === transaction.from)!.balance = currency(
      Number(members.find((m) => m.id === transaction.from)!.balance) +
        parseFloat(transaction.amount)
    ).toString()
    members.find((m) => m.id === transaction.to)!.balance = currency(
      Number(members.find((m) => m.id === transaction.to)!.balance) - parseFloat(transaction.amount)
    ).toString()
  })

  members.forEach((member) => {
    expect(Number(member.balance)).toBe(0)
  })
}

describe('settleDebtsOptimal', () => {
  describe('Basic functionality', () => {
    test('should handle simple one-to-one debt settlement', () => {
      const members = [
        createMember('1', '-10.00', true, false), // owes $10
        createMember('2', '10.00', true, false), // owed $10
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '1',
        to: '2',
        amount: '10.00',
      })

      verifyTransactions(members, result)
    })

    test('should handle multiple debtors to one creditor', () => {
      const members = [
        createMember('1', '-5.00', true, false),
        createMember('2', '-3.00', true, false),
        createMember('3', '8.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { from: '1', to: '3', amount: '5.00' },
        { from: '2', to: '3', amount: '3.00' },
      ])

      verifyTransactions(members, result)
    })

    test('should handle one debtor to multiple creditors', () => {
      const members = [
        createMember('1', '-10.00', true, false),
        createMember('2', '4.00', true, false),
        createMember('3', '6.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(2)

      // Verify total settlement amount is correct
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(10) // Total debt

      expect(result).toEqual([
        { from: '1', to: '2', amount: '4.00' },
        { from: '1', to: '3', amount: '6.00' },
      ])

      verifyTransactions(members, result)
    })

    test('should settle all debts correctly', () => {
      const members = [
        createMember('1', '-15.00', true, false),
        createMember('2', '20.00', true, false),
        createMember('3', '10.00', true, false),
        createMember('4', '-30.00', true, false),
        createMember('5', '15.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      // Verify all transactions are valid
      result.forEach((transaction) => {
        expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
        expect(members.some((m) => m.id === transaction.from)).toBe(true)
        expect(members.some((m) => m.id === transaction.to)).toBe(true)
      })

      // Verify total amount matches debts
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(45) // Total debt amount

      verifyTransactions(members, result)
    })
  })

  describe('Edge cases', () => {
    test('should handle empty array', () => {
      const result = settleDebtsOptimal([])
      expect(result).toEqual([])
    })

    test('should handle array with only creditors', () => {
      const members = [
        createMember('1', '10.00', true, false),
        createMember('2', '5.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      expect(result).toEqual([])
    })

    test('should handle array with only debtors', () => {
      const members = [
        createMember('1', '-10.00', true, false),
        createMember('2', '-5.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      expect(result).toEqual([])
    })

    test('should ignore users with zero balance', () => {
      const members = [
        createMember('1', '0.00', true, false),
        createMember('2', '-10.00', true, false),
        createMember('3', '10.00', true, false),
        createMember('4', '0.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '2',
        to: '3',
        amount: '10.00',
      })

      verifyTransactions(members, result)
    })

    test('should handle single user', () => {
      const members = [createMember('1', '10.00', true, false)]

      const result = settleDebtsOptimal(members)
      expect(result).toEqual([])
    })

    test('should handle all zero balances', () => {
      const members = [
        createMember('1', '0.00', true, false),
        createMember('2', '0.00', true, false),
        createMember('3', '0.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      expect(result).toEqual([])
    })
  })

  describe('Optimization - minimum transactions', () => {
    test('should find optimal solution for triangle scenario', () => {
      // A owes B $10, B owes C $10, C owes A $10
      // Optimal: 0 transactions (everyone cancels out)
      // Greedy: would need 2-3 transactions
      const members = [
        createMember('A', '0.00', true, false), // Net: 0 (owes C $10, owed by A $10)
        createMember('B', '0.00', true, false), // Net: 0 (owes C $10, owed by A $10)
        createMember('C', '0.00', true, false), // Net: 0 (owes A $10, owed by B $10)
      ]

      const result = settleDebtsOptimal(members)
      expect(result).toEqual([]) // Should need 0 transactions when everyone is balanced
    })

    test('should find optimal solution requiring fewer transactions than greedy', () => {
      // Scenario where optimal solution uses fewer transactions
      // A owes $6, B owes $6, C is owed $4, D is owed $8
      // Optimal: A->D ($6), B->C ($4), B->D ($2) = 3 transactions
      // vs potentially more with greedy approach
      const members = [
        createMember('A', '-6.00', true, false),
        createMember('B', '-6.00', true, false),
        createMember('C', '4.00', true, false),
        createMember('D', '8.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      const fastResult = settleDebtsFast(members)

      // Verify correctness
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(12) // Total debt

      // Optimal should use same or fewer transactions than fast
      expect(result.length).toBeLessThanOrEqual(fastResult.length)
      expect(result.length).toBeGreaterThan(0)

      verifyTransactions(members, result)
    })

    test('should handle complex scenario efficiently', () => {
      // More complex scenario to test optimization
      const members = [
        createMember('1', '-20.00', true, false),
        createMember('2', '-10.00', true, false),
        createMember('3', '-5.00', true, false),
        createMember('4', '15.00', true, false),
        createMember('5', '12.00', true, false),
        createMember('6', '8.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      const fastResult = settleDebtsFast(members)

      // Should settle all debts
      const totalDebts = 35 // 20 + 10 + 5
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(totalDebts)

      // Should be optimal (same or fewer transactions than greedy)
      expect(result.length).toBeLessThanOrEqual(fastResult.length)
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(5) // At most n-1 transactions for n non-zero balances

      verifyTransactions(members, result)
    })

    test('should minimize transactions in perfectly balanced scenario', () => {
      // Scenario where balances can be perfectly paired
      const members = [
        createMember('1', '-10.00', true, false),
        createMember('2', '-20.00', true, false),
        createMember('3', '10.00', true, false),
        createMember('4', '20.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      // Should need exactly 2 transactions for perfect pairing
      expect(result).toHaveLength(2)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(30) // Total debt

      verifyTransactions(members, result)
    })
  })

  describe('Precision and currency handling', () => {
    test('should handle decimal amounts correctly', () => {
      const members = [
        createMember('1', '-7.50', true, false),
        createMember('2', '3.25', true, false),
        createMember('3', '4.25', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(2)
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(7.5)

      verifyTransactions(members, result)
    })

    test('should handle very small amounts', () => {
      const members = [
        createMember('1', '-0.01', true, false),
        createMember('2', '0.01', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '1',
        to: '2',
        amount: '0.01',
      })

      verifyTransactions(members, result)
    })

    test('should handle large amounts', () => {
      const members = [
        createMember('1', '-1000.00', true, false),
        createMember('2', '1000.00', true, false),
      ]

      const result = settleDebtsOptimal(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '1',
        to: '2',
        amount: '1000.00',
      })

      verifyTransactions(members, result)
    })
  })

  describe('Algorithm correctness vs fast algorithm', () => {
    test('should produce same total settlement amount as fast algorithm', () => {
      const members = [
        createMember('1', '-15', true, false),
        createMember('2', '20', true, false),
        createMember('3', '10', true, false),
        createMember('4', '10', true, false),
        createMember('5', '-30', true, false),
        createMember('6', '-95', true, false),
        createMember('7', '100', false, false),
      ]

      const optimalResult = settleDebtsOptimal(members)
      const fastResult = settleDebtsFast(members)

      const optimalTotal = optimalResult.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      const fastTotal = fastResult.reduce((sum, t) => sum + parseFloat(t.amount), 0)

      // Both should settle the same total amount
      expect(optimalTotal).toBe(fastTotal)
      expect(optimalTotal).toBe(140)

      // Optimal should use same or fewer transactions
      expect(optimalResult.length).toBeLessThanOrEqual(fastResult.length)
      expect(optimalResult.length).toBeGreaterThan(0)

      verifyTransactions(members, optimalResult)
    })

    test('should handle realistic group expense scenario optimally', () => {
      const members = [
        createMember('alice', '-23.50', true, false),
        createMember('bob', '45.00', true, false),
        createMember('charlie', '-12.25', true, false),
        createMember('diana', '8.75', true, false),
        createMember('eve', '-18.00', true, false),
      ]

      const optimalResult = settleDebtsOptimal(members)
      const fastResult = settleDebtsFast(members)

      const totalDebts = 53.75
      const optimalTotal = optimalResult.reduce((sum, t) => sum + parseFloat(t.amount), 0)

      expect(optimalTotal).toBe(totalDebts)
      expect(optimalResult.length).toBeLessThanOrEqual(fastResult.length)
      expect(optimalResult.length).toBeLessThanOrEqual(4) // Should be very efficient

      verifyTransactions(members, optimalResult)
    })

    test('should find optimal solution through exhaustive search', () => {
      // Test that the optimal algorithm correctly explores all possibilities
      // This case has multiple valid solutions, testing the algorithm's search capability
      // A owes $8, B owes $7, C is owed $10, D is owed $5
      // Multiple 3-transaction solutions exist - the algorithm should find one of them
      const members = [
        createMember('A', '-8.00', true, false),
        createMember('B', '-7.00', true, false),
        createMember('C', '4.00', true, false),
        createMember('D', '-4.00', true, false),
        createMember('E', '7.00', true, false),
        createMember('F', '3.00', true, false),
        createMember('G', '3.00', true, false),
        createMember('H', '2.00', true, false),
      ]

      const result = settleDebtsOptimal(members)
      const fastResult = settleDebtsFast(members)

      // Verify correctness
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(19) // Total debt

      // The optimal algorithm should find a solution that's at least as good as greedy
      expect(result.length).toBeLessThanOrEqual(fastResult.length)
      expect(result.length).toBeGreaterThan(0)

      // For this specific case, 3 transactions should be sufficient and likely optimal
      expect(result.length).toBeLessThanOrEqual(5)

      // Verify all transactions are valid and positive
      result.forEach((transaction) => {
        expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
        expect(members.some((m) => m.id === transaction.from)).toBe(true)
        expect(members.some((m) => m.id === transaction.to)).toBe(true)
      })

      verifyTransactions(members, result)
    })
  })

  describe('Performance and memoization', () => {
    test('should handle moderate complexity without timeout', () => {
      // Test with enough complexity to trigger memoization but not too slow
      const members = [
        createMember('1', '-5.00', true, false),
        createMember('2', '-8.00', true, false),
        createMember('3', '-5.00', true, false),
        createMember('4', '-4.00', true, false),
        createMember('5', '-7.00', true, false),
        createMember('6', '-12.00', true, false),
        createMember('7', '2.00', true, false),
        createMember('8', '14.00', true, false),
        createMember('9', '15.00', true, false),
        createMember('10', '10.00', true, false),
      ]

      const startTime = Date.now()
      const result = settleDebtsOptimal(members)
      const endTime = Date.now()

      // Should complete in reasonable time (less than 0.15 second)
      expect(endTime - startTime).toBeLessThan(150)

      // Should still produce correct results
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(41) // Total debt

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(9)

      verifyTransactions(members, result)
    })
  })
})
