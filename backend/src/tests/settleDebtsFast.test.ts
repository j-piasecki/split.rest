import { settleDebtsFast } from '../database/utils/settleUp/settleDebtsFast'
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
    displayName: null,
    pictureId: null,
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

describe('settleDebtsFast', () => {
  describe('Basic functionality', () => {
    test('should handle simple one-to-one debt settlement', () => {
      const members = [
        createMember('1', '-10.00', true, false), // owes $10
        createMember('2', '10.00', true, false), // owed $10
      ]

      const result = settleDebtsFast(members)

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

      const result = settleDebtsFast(members)

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

      const result = settleDebtsFast(members)

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { from: '1', to: '2', amount: '4.00' },
        { from: '1', to: '3', amount: '6.00' },
      ])

      verifyTransactions(members, result)
    })

    test('should handle complex scenario with multiple debtors and creditors', () => {
      const members = [
        createMember('1', '-15.00', true, false),
        createMember('2', '20.00', true, false),
        createMember('3', '10.00', true, false),
        createMember('4', '-30.00', true, false),
        createMember('5', '15.00', true, false),
      ]

      const result = settleDebtsFast(members)

      // Should create minimal transactions to settle all debts
      expect(result.length).toBeGreaterThan(0)

      // Verify all transactions are valid (positive amounts, valid IDs)
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
      const result = settleDebtsFast([])
      expect(result).toEqual([])
    })

    test('should handle array with only creditors', () => {
      const members = [
        createMember('1', '10.00', true, false),
        createMember('2', '5.00', true, false),
      ]

      const result = settleDebtsFast(members)
      expect(result).toEqual([])
    })

    test('should handle array with only debtors', () => {
      const members = [
        createMember('1', '-10.00', true, false),
        createMember('2', '-5.00', true, false),
      ]

      const result = settleDebtsFast(members)
      expect(result).toEqual([])
    })

    test('should ignore users with zero balance', () => {
      const members = [
        createMember('1', '0.00', true, false),
        createMember('2', '-10.00', true, false),
        createMember('3', '10.00', true, false),
        createMember('4', '0.00', true, false),
      ]

      const result = settleDebtsFast(members)

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

      const result = settleDebtsFast(members)
      expect(result).toEqual([])
    })

    test('should handle all zero balances', () => {
      const members = [
        createMember('1', '0.00', true, false),
        createMember('2', '0.00', true, false),
        createMember('3', '0.00', true, false),
      ]

      const result = settleDebtsFast(members)
      expect(result).toEqual([])
    })
  })

  describe('Precision and currency handling', () => {
    test('should handle decimal amounts correctly', () => {
      const members = [
        createMember('1', '-7.50', true, false),
        createMember('2', '3.25', true, false),
        createMember('3', '4.25', true, false),
      ]

      const result = settleDebtsFast(members)

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { from: '1', to: '2', amount: '3.25' },
        { from: '1', to: '3', amount: '4.25' },
      ])

      verifyTransactions(members, result)
    })

    test('should handle very small amounts', () => {
      const members = [
        createMember('1', '-0.01', true, false),
        createMember('2', '0.01', true, false),
      ]

      const result = settleDebtsFast(members)

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

      const result = settleDebtsFast(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '1',
        to: '2',
        amount: '1000.00',
      })

      verifyTransactions(members, result)
    })
  })

  describe('Algorithm efficiency', () => {
    test('should process debtors and creditors in order (greedy approach)', () => {
      const members = [
        createMember('1', '-100.00', true, false), // Large debtor
        createMember('2', '-1.00', true, false), // Small debtor
        createMember('3', '50.00', true, false), // First creditor
        createMember('4', '51.00', true, false), // Second creditor
      ]

      const result = settleDebtsFast(members)

      // Algorithm processes creditors in order, not by amount
      expect(result[0]).toEqual({
        from: '1',
        to: '3',
        amount: '50.00',
      })
      expect(result[1]).toEqual({
        from: '1',
        to: '4',
        amount: '50.00',
      })
      expect(result[2]).toEqual({
        from: '2',
        to: '4',
        amount: '1.00',
      })

      verifyTransactions(members, result)
    })

    test('should handle uneven debt-to-credit ratios', () => {
      const members = [
        createMember('1', '-20.00', true, false),
        createMember('2', '-30.00', true, false),
        createMember('3', '15.00', true, false), // Can't fully settle either debt
        createMember('4', '35.00', true, false),
      ]

      const result = settleDebtsFast(members)

      expect(result.length).toBeGreaterThan(0)

      // Verify balances work out correctly
      const totalDebts = 50
      const totalTransactions = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalTransactions).toBe(totalDebts)

      verifyTransactions(members, result)
    })
  })

  describe('Real-world scenarios', () => {
    test('should handle realistic group expense scenario', () => {
      const members = [
        createMember('alice', '-23.50', true, false), // Owes money
        createMember('bob', '45.00', true, false), // Paid more
        createMember('charlie', '-12.25', true, false), // Owes money
        createMember('diana', '8.75', true, false), // Paid a bit more
        createMember('eve', '-18.00', true, false), // Owes money
      ]

      const result = settleDebtsFast(members)

      // Verify all debts are settled
      const totalDebts = 23.5 + 12.25 + 18.0 // 53.75
      const totalTransactions = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)

      expect(totalTransactions).toBe(totalDebts)
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(5) // Should be efficient

      verifyTransactions(members, result)
    })

    test('should handle the provided fakeMembers scenario', () => {
      const fakeMembers: Member[] = [
        createMember('1', '-15', true, false),
        createMember('2', '20', true, false),
        createMember('3', '10', true, false),
        createMember('4', '10', true, false),
        createMember('5', '-30', true, false),
        createMember('6', '-95', true, false),
        createMember('7', '100', false, false),
      ]

      const result = settleDebtsFast(fakeMembers)

      // Total debts: 15 + 30 + 95 = 140
      // Total credits: 20 + 10 + 10 + 100 = 140
      const totalTransactions = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalTransactions).toBe(140)

      // Should create reasonable number of transactions
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(6) // At most n-1 transactions needed

      // All transaction amounts should be positive
      result.forEach((transaction) => {
        expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
      })

      verifyTransactions(fakeMembers, result)
    })
  })
})
