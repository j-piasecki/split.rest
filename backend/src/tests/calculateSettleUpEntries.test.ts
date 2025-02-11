import { calculateSettleUpEntries } from '../database/splits/settleUp'
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

describe('calculateSettleUpEntries', () => {
  it('should settle up negative balance with a single person with access if possible', () => {
    const entries = calculateSettleUpEntries('1', -10, fakeMembers)

    expect(entries).toEqual([
      {
        id: '1',
        change: '10.00',
      },
      {
        id: '2',
        change: '-10.00',
      },
    ])
  })

  it('should settle up negative balance with minimal number of people with access', () => {
    const entries = calculateSettleUpEntries('5', -25, fakeMembers)

    expect(entries).toEqual([
      {
        id: '5',
        change: '25.00',
      },
      {
        id: '2',
        change: '-20.00',
      },
      {
        id: '3',
        change: '-5.00',
      },
    ])
  })

  it('should settle up positive balance with a single person with access if possible', () => {
    const entries = calculateSettleUpEntries('3', 10, fakeMembers)

    expect(entries).toEqual([
      {
        id: '3',
        change: '-10.00',
      },
      {
        id: '6',
        change: '10.00',
      },
    ])
  })

  it('should settle up positive balance with minimal number of people with access', () => {
    const entries = calculateSettleUpEntries('5', -30, fakeMembers)

    expect(entries).toEqual([
      {
        id: '5',
        change: '30.00',
      },
      {
        id: '2',
        change: '-20.00',
      },
      {
        id: '3',
        change: '-10.00',
      },
    ])
  })

  it('should settle up with people without access if not possible otherwise', () => {
    const entries = calculateSettleUpEntries('6', -95, fakeMembers)

    expect(entries).toEqual([
      {
        id: '6',
        change: '95.00',
      },
      {
        id: '2',
        change: '-20.00',
      },
      {
        id: '3',
        change: '-10.00',
      },
      {
        id: '4',
        change: '-10.00',
      },
      {
        id: '7',
        change: '-55.00',
      },
    ])
  })
})
