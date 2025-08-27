import { prepareGroupSettleUp } from '../database/utils/settleUp/prepareGroupSettleUp'
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

describe('prepareGroupSettleUp', () => {
  test('should group transactions by target recipient', () => {
    const members = [
      createMember('1', '-10.00'), // owes $10
      createMember('2', '-5.00'), // owes $5
      createMember('3', '15.00'), // owed $15
    ]

    const result = prepareGroupSettleUp(members, [])

    expect(result).toHaveLength(1)
    expect(result[0].targetId).toBe('3')
    expect(result[0].payments).toHaveLength(2)

    // Verify total payments to target
    const totalToTarget = result[0].payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    expect(totalToTarget).toBe(15)
  })

  test('should handle multiple targets', () => {
    const members = [
      createMember('1', '-10.00'), // owes $10
      createMember('2', '5.00'), // owed $5
      createMember('3', '5.00'), // owed $5
    ]

    const result = prepareGroupSettleUp(members, [])

    expect(result).toHaveLength(2)

    // Should have settlements for both targets
    const targetIds = result.map((r) => r.targetId).sort()
    expect(targetIds).toEqual(['2', '3'])
  })

  test('should filter out balanced members', () => {
    const members = [
      createMember('1', '0.00'), // balanced - should be filtered
      createMember('2', '-10.00'), // owes $10
      createMember('3', '10.00'), // owed $10
      createMember('4', '0.00'), // balanced - should be filtered
    ]

    const result = prepareGroupSettleUp(members, [])

    expect(result).toHaveLength(1)
    expect(result[0].targetId).toBe('3')
    expect(result[0].payments).toHaveLength(1)
    expect(result[0].payments[0].from).toBe('2')
  })

  test('should return empty array when no settlements needed', () => {
    const members = [createMember('1', '0.00'), createMember('2', '0.00')]

    const result = prepareGroupSettleUp(members, [])

    expect(result).toEqual([])
  })
})
