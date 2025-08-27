import { settleDebts } from '../database/utils/settleUp/settleDebts'
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
  }
}

describe('settleDebts', () => {
  describe('Perfect matches integration', () => {
    test('should prioritize perfect matches before algorithm', () => {
      const members = [
        createMember('1', '-10.00'), // perfect match with 2
        createMember('2', '10.00'), // perfect match with 1
        createMember('3', '-5.00'), // needs algorithm
        createMember('4', '5.00'), // needs algorithm
      ]

      const result = settleDebts(members)

      expect(result).toHaveLength(2)

      // Verify all debts are settled
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(15) // 10 + 5

      // Verify transaction validity
      result.forEach((transaction) => {
        expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
        expect(members.some((m) => m.id === transaction.from)).toBe(true)
        expect(members.some((m) => m.id === transaction.to)).toBe(true)
      })
    })

    test('should handle all perfect matches scenario', () => {
      const members = [
        createMember('1', '-20.00'),
        createMember('2', '-15.00'),
        createMember('3', '20.00'),
        createMember('4', '15.00'),
      ]

      const result = settleDebts(members)

      expect(result).toHaveLength(2)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(35) // 20 + 15
    })

    test('should handle no perfect matches scenario', () => {
      const members = [
        createMember('1', '-12.00'),
        createMember('2', '-8.00'),
        createMember('3', '7.00'),
        createMember('4', '13.00'),
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(20) // 12 + 8
    })

    test('should combine perfect matches with algorithmic settlement', () => {
      const members = [
        createMember('1', '-15.00'), // perfect match
        createMember('2', '15.00'), // perfect match
        createMember('3', '-8.00'), // algorithmic
        createMember('4', '-2.00'), // algorithmic
        createMember('5', '6.00'), // algorithmic
        createMember('6', '4.00'), // algorithmic
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(1)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(25) // 15 + 8 + 2
    })
  })

  describe('Algorithm selection', () => {
    test('should use optimal algorithm for small groups (≤10 remaining users)', () => {
      // Create 8 users (all will remain after perfect match extraction)
      const members = Array.from({ length: 8 }, (_, i) =>
        createMember(`${i + 1}`, i < 4 ? '-10.00' : '10.00')
      )

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(7) // Should be efficient (optimal algorithm)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(40) // 4 * 10
    })

    test('should use fast algorithm for large groups (>10 remaining users)', () => {
      // Create 12 users with mismatched amounts (no perfect matches)
      const members = [
        ...Array.from({ length: 6 }, (_, i) =>
          createMember(`debtor${i + 1}`, '-' + (10 + i).toFixed(2))
        ),
        ...Array.from({ length: 6 }, (_, i) =>
          createMember(`creditor${i + 1}`, (10 + i).toFixed(2))
        ),
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)

      const totalDebts = 6 * 10 + (0 + 1 + 2 + 3 + 4 + 5) // 60 + 15 = 75
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(totalDebts)
    })

    test('should handle threshold edge case (exactly 10 remaining users)', () => {
      // Create scenario with exactly 10 remaining users after perfect matches
      const members = [
        createMember('perfect1', '-100.00'), // perfect match
        createMember('perfect2', '100.00'), // perfect match
        ...Array.from({ length: 10 }, (_, i) =>
          createMember(`user${i + 1}`, i < 5 ? '-5.00' : '5.00')
        ),
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(1) // At least perfect match + algorithm results

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(125) // 100 + 25
    })
  })

  describe('Edge cases', () => {
    test('should handle empty array', () => {
      const result = settleDebts([])
      expect(result).toEqual([])
    })

    test('should handle single user', () => {
      const members = [createMember('1', '10.00')]
      const result = settleDebts(members)
      expect(result).toEqual([])
    })

    test('should handle all zero balances', () => {
      const members = [
        createMember('1', '0.00'),
        createMember('2', '0.00'),
        createMember('3', '0.00'),
      ]
      const result = settleDebts(members)
      expect(result).toEqual([])
    })

    test('should handle only debtors', () => {
      const members = [
        createMember('1', '-10.00'),
        createMember('2', '-5.00'),
        createMember('3', '-15.00'),
      ]
      const result = settleDebts(members)
      expect(result).toEqual([])
    })

    test('should handle only creditors', () => {
      const members = [
        createMember('1', '10.00'),
        createMember('2', '5.00'),
        createMember('3', '15.00'),
      ]
      const result = settleDebts(members)
      expect(result).toEqual([])
    })

    test('should handle mixed with zero balances', () => {
      const members = [
        createMember('1', '0.00'),
        createMember('2', '-10.00'),
        createMember('3', '10.00'),
        createMember('4', '0.00'),
      ]

      const result = settleDebts(members)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        from: '2',
        to: '3',
        amount: '10.00',
      })
    })
  })

  describe('Complex real-world scenarios', () => {
    test('should handle large group dinner scenario', () => {
      const members = [
        createMember('alice', '-25.50'), // paid less
        createMember('bob', '30.00'), // paid more
        createMember('charlie', '-15.00'), // paid less
        createMember('diana', '15.00'), // paid more (perfect match with charlie)
        createMember('eve', '-12.25'), // paid less
        createMember('frank', '8.75'), // paid more
        createMember('grace', '-1.00'), // paid less
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)

      const totalDebts = 25.5 + 15.0 + 12.25 + 1.0 // 53.75
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(totalDebts)

      // Verify all transactions are valid
      result.forEach((transaction) => {
        expect(parseFloat(transaction.amount)).toBeGreaterThan(0)
        expect(['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace']).toContain(
          transaction.from
        )
        expect(['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace']).toContain(
          transaction.to
        )
      })
    })

    test('should handle vacation expense split', () => {
      // Scenario: Some people paid hotel, others paid meals, flights, etc.
      const members = [
        createMember('hotel_payer', '450.00'), // paid hotel
        createMember('flight_payer', '200.00'), // paid flights
        createMember('meal_payer1', '80.00'), // paid some meals
        createMember('meal_payer2', '70.00'), // paid some meals
        createMember('person1', '-150.00'), // owes money
        createMember('person2', '-150.00'), // owes money
        createMember('person3', '-250.00'), // owes money (perfect match with flight_payer)
        createMember('person4', '-250.00'), // owes money
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)

      const totalDebts = 150 + 150 + 250 + 250 // 800
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(totalDebts)
    })

    test('should efficiently handle perfect match heavy scenario', () => {
      // Scenario where most debts have perfect matches
      const members = [
        createMember('1', '-50.00'),
        createMember('2', '50.00'), // perfect pair
        createMember('3', '-25.00'),
        createMember('4', '25.00'), // perfect pair
        createMember('5', '-10.00'),
        createMember('6', '10.00'), // perfect pair
        createMember('7', '-5.00'),
        createMember('8', '5.00'), // perfect pair
        createMember('9', '-3.00'), // needs algorithm
        createMember('10', '3.00'), // needs algorithm
      ]

      const result = settleDebts(members)

      expect(result).toHaveLength(5) // 4 perfect matches + 1 algorithmic

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(93) // 50+25+10+5+3
    })
  })

  describe('Transaction format and validation', () => {
    test('should return properly formatted transactions', () => {
      const members = [createMember('debtor_123', '-42.75'), createMember('creditor_456', '42.75')]

      const result = settleDebts(members)

      expect(result).toHaveLength(1)
      const transaction = result[0]

      // Verify transaction structure
      expect(transaction).toHaveProperty('from')
      expect(transaction).toHaveProperty('to')
      expect(transaction).toHaveProperty('amount')

      // Verify values
      expect(transaction.from).toBe('debtor_123')
      expect(transaction.to).toBe('creditor_456')
      expect(transaction.amount).toBe('42.75')
    })

    test('should maintain data integrity across complex settlement', () => {
      const members = [
        createMember('1', '-100.00'),
        createMember('2', '-50.00'),
        createMember('3', '-25.00'),
        createMember('4', '75.00'),
        createMember('5', '100.00'),
      ]

      const result = settleDebts(members)

      // All users should be accounted for in transactions
      const involvedUsers = new Set([...result.map((t) => t.from), ...result.map((t) => t.to)])

      // All debtors and creditors should be involved
      expect(involvedUsers.has('1')).toBe(true) // debtor
      expect(involvedUsers.has('2')).toBe(true) // debtor
      expect(involvedUsers.has('3')).toBe(true) // debtor
      expect(involvedUsers.has('4')).toBe(true) // creditor
      expect(involvedUsers.has('5')).toBe(true) // creditor

      // Total settlement should match total debts
      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(175) // 100 + 50 + 25
    })

    test('should handle precision correctly', () => {
      const members = [
        createMember('1', '-33.33'),
        createMember('2', '-33.33'),
        createMember('3', '-33.34'), // Slightly different for precision
        createMember('4', '100.00'),
      ]

      const result = settleDebts(members)

      expect(result.length).toBeGreaterThan(0)

      const totalSettled = result.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      expect(totalSettled).toBe(100) // Should handle precision correctly
    })
  })
})
