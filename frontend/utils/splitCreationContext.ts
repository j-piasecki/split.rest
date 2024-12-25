import { auth } from './firebase'
import { getUserByEmail } from '@database/getUserByEmail'
import { SplitType, SplitWithUsers, TranslatableError, User, UserWithBalanceChange } from 'shared'

interface UserWithValue {
  userOrEmail: User | string
  value?: string
}

export enum SplitMethod {
  ExactAmounts = 'exactAmounts',
  Equal = 'equal',
}

export interface SplitCreationContextArguments {
  participants?: UserWithValue[]
  paidByEmail?: string
  splitType?: SplitMethod
  title?: string
  totalAmount?: string
  timestamp?: number
}

class SplitCreationContext {
  participants: UserWithValue[] | null = null
  paidByEmail: string | null = null
  splitType: SplitMethod | null = null
  title: string | null = null
  totalAmount: string | null = null
  timestamp: number | null = null

  constructor(args: SplitCreationContextArguments) {
    this.participants = args.participants ?? null
    this.paidByEmail = args.paidByEmail ?? null
    this.splitType = args.splitType ?? null
    this.title = args.title ?? null
    this.totalAmount = args.totalAmount ?? null
    this.timestamp = args.timestamp ?? null
  }

  get paidByIndex(): number | undefined {
    if (this.participants === null || this.paidByEmail === null) {
      return undefined
    }

    const index = this.participants.findIndex((participant) => {
      if (typeof participant.userOrEmail === 'string') {
        return participant.userOrEmail === this.paidByEmail
      }

      return participant.userOrEmail.email === this.paidByEmail
    })

    return index === -1 ? undefined : index
  }

  private async getParticipantsData(): Promise<UserWithBalanceChange[]> {
    if (this.participants === null) {
      return []
    }

    const asyncUsers = this.participants.map(async (participant) => {
      if (typeof participant.userOrEmail === 'string') {
        const user = await getUserByEmail(participant.userOrEmail)

        if (!user) {
          throw new TranslatableError('api.notFound.user')
        }

        return user
      }

      return participant.userOrEmail
    })

    const users = await Promise.all(asyncUsers)

    if (this.splitType === SplitMethod.Equal) {
      const amount = Math.floor((Number(this.totalAmount) * 100) / users.length) / 100
      const totalRounded = amount * users.length
      const difference = Math.floor((Number(this.totalAmount) - totalRounded) * 100)
      let distributed = 0

      this.participants.forEach((participant) => {
        participant.value = (distributed++ < difference ? amount + 0.01 : amount).toFixed(2)
      })

      if (this.participants.some((participant) => Number(participant.value) <= 0)) {
        throw new TranslatableError('splitValidation.tooLittleToDivide')
      }
    }

    return users.map((user, index) => {
      const amount = this.participants![index].value!
      const change =
        user.email === this.paidByEmail
          ? Number(this.totalAmount) - Number(amount)
          : -Number(amount)

      return {
        ...user,
        change: change.toFixed(2),
      }
    })
  }

  async buildSplitPreview(): Promise<SplitWithUsers> {
    const users = await this.getParticipantsData()
    const paidById = users.find((user) => user.email === this.paidByEmail)?.id

    if (!paidById) {
      throw new TranslatableError('splitValidation.payerNotFound')
    }

    if (!this.title) {
      throw new TranslatableError('splitValidation.titleIsRequired')
    }

    if (!this.totalAmount) {
      throw new TranslatableError('splitValidation.totalRequired')
    }

    if (!auth.currentUser) {
      throw new TranslatableError('api.mustBeLoggedIn')
    }

    return {
      id: -1,
      title: this.title,
      total: this.totalAmount,
      timestamp: this.timestamp ?? Date.now(),
      paidById: paidById,
      version: 1,
      createdById: auth.currentUser.uid,
      updatedAt: this.timestamp ?? Date.now(),
      isUserParticipating: users.find((user) => user.email === auth.currentUser?.email)
        ? true
        : false,
      type: SplitType.Normal,
      users: users,
    }
  }
}

let currentContext: SplitCreationContext | null = null

export function getSplitCreationContext() {
  if (!currentContext) {
    currentContext = new SplitCreationContext({})

    if (__DEV__) {
      console.warn('No split creation context found, creating a new one')
    }
  }

  return currentContext
}

export function beginNewSplit(args?: SplitCreationContextArguments) {
  currentContext = new SplitCreationContext(args ?? {})
}
