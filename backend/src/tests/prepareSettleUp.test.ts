import { TargetedBalanceChange, prepareSettleUp } from '../database/utils/prepareSettleUp'
import { Member } from 'shared'

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

const fakeMembers: Member[] = [
  createMember('1', '-15', true, false),
  createMember('2', '20', true, false),
  createMember('3', '10', true, false),
  createMember('4', '10', true, false),
  createMember('5', '-30', true, false),
  createMember('6', '-95', true, false),
  createMember('7', '100', false, false),
]

describe('prepareSettleUp', () => {
  it('should settle up negative balance with a single person with access if possible', () => {
    const entries = prepareSettleUp('1', -10, fakeMembers, [])

    expect(entries).toEqual([
      {
        id: '1',
        change: '10.00',
        pending: true,
      },
      {
        id: '2',
        change: '-10.00',
        pending: true,
      },
    ])
  })

  it('should settle up negative balance with minimal number of people with access', () => {
    const entries = prepareSettleUp('5', -25, fakeMembers, [])

    expect(entries).toEqual([
      {
        id: '5',
        change: '25.00',
        pending: true,
      },
      {
        id: '2',
        change: '-20.00',
        pending: true,
      },
      {
        id: '3',
        change: '-5.00',
        pending: true,
      },
    ])
  })

  it('should settle up positive balance with a single person with access if possible', () => {
    const entries = prepareSettleUp('3', 10, fakeMembers, [])

    expect(entries).toEqual([
      {
        id: '3',
        change: '-10.00',
        pending: true,
      },
      {
        id: '6',
        change: '10.00',
        pending: true,
      },
    ])
  })

  it('should settle up positive balance with minimal number of people with access', () => {
    const entries = prepareSettleUp('5', -30, fakeMembers, [])

    expect(entries).toEqual([
      {
        id: '5',
        change: '30.00',
        pending: true,
      },
      {
        id: '2',
        change: '-20.00',
        pending: true,
      },
      {
        id: '3',
        change: '-10.00',
        pending: true,
      },
    ])
  })

  it('should settle up with people without access if not possible otherwise', () => {
    const entries = prepareSettleUp('6', -95, fakeMembers, [])

    expect(entries).toEqual([
      {
        id: '6',
        change: '95.00',
        pending: true,
      },
      {
        id: '2',
        change: '-20.00',
        pending: true,
      },
      {
        id: '3',
        change: '-10.00',
        pending: true,
      },
      {
        id: '4',
        change: '-10.00',
        pending: true,
      },
      {
        id: '7',
        change: '-55.00',
        pending: true,
      },
    ])
  })

  it('should settle up negative balance with a single person with access taking into account pending splits', () => {
    const members: Member[] = [
      createMember('1', '-15', true, false),
      createMember('2', '5', true, false),
      createMember('3', '10', true, false),
    ]
    const pendingChanges: TargetedBalanceChange[] = [
      {
        id: '2',
        change: '-5.00',
        targetId: '3',
        pending: true,
      },
    ]
    const entries = prepareSettleUp('1', -15, members, pendingChanges)

    expect(entries).toEqual([
      {
        id: '1',
        change: '15.00',
        pending: true,
      },
      {
        id: '3',
        change: '-15.00',
        pending: true,
      },
    ])
  })

  it('should resolve the pending balance of the person settling up', () => {
    const members: Member[] = [
      createMember('1', '-15', true, false),
      createMember('2', '5', true, false),
      createMember('3', '10', true, false),
    ]
    const pendingChanges: TargetedBalanceChange[] = [
      {
        id: '2',
        change: '-5.00',
        targetId: '1',
        pending: true,
      },
    ]
    const entries = prepareSettleUp('1', -15, members, pendingChanges)

    expect(entries).toEqual([
      {
        id: '1',
        change: '10.00',
        pending: true,
      },
      {
        id: '3',
        change: '-10.00',
        pending: true,
      },
    ])
  })

  it('should return empty result when already settled up but pending', () => {
    const members: Member[] = [
      createMember('1', '-15', true, false),
      createMember('2', '15', true, false),
    ]
    const pendingChanges: TargetedBalanceChange[] = [
      {
        id: '2',
        change: '-15.00',
        targetId: '1',
        pending: true,
      },
    ]
    const entries = prepareSettleUp('1', -15, members, pendingChanges)

    expect(entries).toEqual([
      {
        id: '1',
        change: '0.00',
        pending: true,
      },
    ])
  })
})
