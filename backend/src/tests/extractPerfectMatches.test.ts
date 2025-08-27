import { extractPerfectMatches } from '../database/utils/settleUp/settleDebts'
import { Member } from 'shared'

function createMember(id: string, balance: string): Member {
  return {
    id,
    balance,
    hasAccess: true,
    deleted: false,
    isAdmin: false,
    email: `user_${id}@email.com`,
    name: `User ${id}`,
    displayName: null,
    pictureId: null,
  }
}

describe('extractPerfectMatches', () => {
  describe('Basic functionality', () => {
    test('should find single perfect match', () => {
      const members = [
        createMember('1', '-10.00'), // owes $10
        createMember('2', '10.00'), // owed $10
        createMember('3', '-5.00'), // owes $5 (no match)
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0]).toEqual({
        from: '1',
        to: '2',
        amount: '10.00',
      })

      expect(result.remainingUsers).toHaveLength(1)
      expect(result.remainingUsers[0].id).toBe('3')
    })

    test('should find multiple perfect matches', () => {
      const members = [
        createMember('1', '-10.00'), // owes $10
        createMember('2', '10.00'), // owed $10
        createMember('3', '-5.00'), // owes $5
        createMember('4', '5.00'), // owed $5
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(2)
      expect(result.remainingUsers).toHaveLength(0)

      // Verify all debts are matched
      const totalSettled = result.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(15) // 10 + 5
    })

    test('should handle multiple creditors with same amount', () => {
      const members = [
        createMember('1', '-10.00'), // owes $10
        createMember('2', '-10.00'), // owes $10
        createMember('3', '10.00'), // owed $10
        createMember('4', '10.00'), // owed $10
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(2)
      expect(result.remainingUsers).toHaveLength(0)

      // All transactions should be for $10
      result.transactions.forEach((transaction) => {
        expect(transaction.amount).toBe('10.00')
      })
    })

    test('should find all perfect matches', () => {
      const members = [
        createMember('1', '-15.00'), // owes $15 (perfect match with 4)
        createMember('2', '-10.00'), // owes $10 (perfect match with 3)
        createMember('3', '10.00'), // owed $10 (perfect match with 2)
        createMember('4', '15.00'), // owed $15 (perfect match with 1)
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(2)
      expect(result.remainingUsers).toHaveLength(0)

      // Verify all perfect matches were found
      const totalSettled = result.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(25) // 15 + 10
    })
  })

  describe('Edge cases', () => {
    test('should handle empty array', () => {
      const result = extractPerfectMatches([])

      expect(result.transactions).toEqual([])
      expect(result.remainingUsers).toEqual([])
    })

    test('should handle no perfect matches', () => {
      const members = [
        createMember('1', '-10.00'), // owes $10
        createMember('2', '-5.00'), // owes $5
        createMember('3', '7.00'), // owed $7
        createMember('4', '8.00'), // owed $8
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toEqual([])
      expect(result.remainingUsers).toHaveLength(4)
      expect(result.remainingUsers).toEqual(members)
    })

    test('should ignore zero balances', () => {
      const members = [
        createMember('1', '0.00'), // balanced
        createMember('2', '-10.00'), // owes $10
        createMember('3', '10.00'), // owed $10
        createMember('4', '0.00'), // balanced
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0]).toEqual({
        from: '2',
        to: '3',
        amount: '10.00',
      })

      // Zero balance users should remain (not be filtered here)
      expect(result.remainingUsers).toHaveLength(2)
      const remainingIds = result.remainingUsers.map((u) => u.id).sort()
      expect(remainingIds).toEqual(['1', '4'])
    })

    test('should handle only debtors', () => {
      const members = [
        createMember('1', '-10.00'),
        createMember('2', '-5.00'),
        createMember('3', '-15.00'),
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toEqual([])
      expect(result.remainingUsers).toEqual(members)
    })

    test('should handle only creditors', () => {
      const members = [
        createMember('1', '10.00'),
        createMember('2', '5.00'),
        createMember('3', '15.00'),
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toEqual([])
      expect(result.remainingUsers).toEqual(members)
    })
  })

  describe('Precision and currency handling', () => {
    test('should handle decimal amounts correctly', () => {
      const members = [
        createMember('1', '-7.50'),
        createMember('2', '7.50'),
        createMember('3', '-12.25'),
        createMember('4', '12.25'),
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(2)
      expect(result.remainingUsers).toHaveLength(0)

      const amounts = result.transactions.map((t) => t.amount).sort()
      expect(amounts).toEqual(['12.25', '7.50'])
    })

    test('should handle very small amounts', () => {
      const members = [createMember('1', '-0.01'), createMember('2', '0.01')]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0]).toEqual({
        from: '1',
        to: '2',
        amount: '0.01',
      })
    })

    test('should handle large amounts', () => {
      const members = [createMember('1', '-1000.00'), createMember('2', '1000.00')]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0]).toEqual({
        from: '1',
        to: '2',
        amount: '1000.00',
      })
    })
  })

  describe('Complex scenarios', () => {
    test('should handle partial perfect matches in large group', () => {
      const members = [
        createMember('1', '-20.00'), // perfect match with 6
        createMember('2', '-15.00'), // no perfect match
        createMember('3', '-10.00'), // perfect match with 7
        createMember('4', '-5.00'), // perfect match with 8
        createMember('5', '12.00'), // no perfect match
        createMember('6', '20.00'), // perfect match with 1
        createMember('7', '10.00'), // perfect match with 3
        createMember('8', '5.00'), // perfect match with 4
        createMember('9', '3.00'), // no perfect match
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(3)
      expect(result.remainingUsers).toHaveLength(3)

      // Verify perfect matches
      const totalPerfectSettlement = result.transactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      )
      expect(totalPerfectSettlement).toBe(35) // 20 + 10 + 5

      // Verify remaining users have no perfect matches among themselves
      const remainingIds = result.remainingUsers.map((u) => u.id).sort()
      expect(remainingIds).toEqual(['2', '5', '9'])
    })

    test('should pick creditor from available pool when multiple exist', () => {
      const members = [
        createMember('debtor', '-10.00'),
        createMember('creditor1', '10.00'),
        createMember('creditor2', '10.00'),
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      expect(result.remainingUsers).toHaveLength(1)

      // One creditor should be picked for the transaction
      const transactionCreditor = result.transactions[0].to
      expect(['creditor1', 'creditor2']).toContain(transactionCreditor)

      // The other creditor should remain
      const remainingCreditor = result.remainingUsers[0].id
      expect(['creditor1', 'creditor2']).toContain(remainingCreditor)

      // Should be different creditors
      expect(transactionCreditor).not.toBe(remainingCreditor)
    })

    test('should handle realistic group expense scenario', () => {
      // Simulating a group where some people happened to owe/be owed the same amounts
      const members = [
        createMember('alice', '-25.00'), // paid less
        createMember('bob', '25.00'), // paid more (perfect match)
        createMember('charlie', '-15.00'), // paid less
        createMember('diana', '15.00'), // paid more (perfect match)
        createMember('eve', '-10.00'), // paid less (no perfect match)
        createMember('frank', '12.00'), // paid more (no perfect match)
        createMember('grace', '-2.00'), // paid less (no perfect match)
      ]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(2) // alice↔bob, charlie↔diana
      expect(result.remainingUsers).toHaveLength(3) // eve, frank, grace

      const perfectlySettled = result.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(perfectlySettled).toBe(40) // 25 + 15
    })
  })

  describe('Transaction validation', () => {
    test('should create valid transaction objects', () => {
      const members = [createMember('debtor123', '-50.00'), createMember('creditor456', '50.00')]

      const result = extractPerfectMatches(members)

      expect(result.transactions).toHaveLength(1)
      const transaction = result.transactions[0]

      // Verify transaction structure
      expect(transaction).toHaveProperty('from')
      expect(transaction).toHaveProperty('to')
      expect(transaction).toHaveProperty('amount')

      // Verify values
      expect(transaction.from).toBe('debtor123')
      expect(transaction.to).toBe('creditor456')
      expect(transaction.amount).toBe('50.00')

      // Amount should be positive
      expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
    })

    test('should maintain data integrity', () => {
      const members = [
        createMember('1', '-30.00'),
        createMember('2', '-20.00'),
        createMember('3', '20.00'),
        createMember('4', '30.00'),
      ]

      const result = extractPerfectMatches(members)

      // Original array should not be modified
      expect(members).toHaveLength(4)

      // All users should be accounted for
      const processedUsers = result.transactions.length * 2 + result.remainingUsers.length
      expect(processedUsers).toBe(members.length)

      // No user should appear in both transactions and remaining
      const transactionUserIds = new Set([
        ...result.transactions.map((t) => t.from),
        ...result.transactions.map((t) => t.to),
      ])
      const remainingUserIds = new Set(result.remainingUsers.map((u) => u.id))

      expect(transactionUserIds.size + remainingUserIds.size).toBe(members.length)

      // No overlap between transaction participants and remaining users
      for (const remainingId of remainingUserIds) {
        expect(transactionUserIds.has(remainingId)).toBe(false)
      }
    })
  })
})
