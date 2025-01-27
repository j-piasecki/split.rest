import { auth } from './firebase'
import { SplitType, SplitWithUsers, TranslatableError, User, UserWithBalanceChange } from 'shared'

interface UserWithValue {
  user: User
  value?: string
}

export enum SplitMethod {
  ExactAmounts = 'exactAmounts',
  Equal = 'equal',
}

export interface SplitCreationContextArguments {
  participants?: UserWithValue[]
  paidById?: string
  splitType?: SplitMethod
  title?: string
  totalAmount?: string
  amountPerUser?: string
  timestamp?: number
}

class SplitCreationContext {
  participants: UserWithValue[] | null = null
  paidById: string | null = null
  splitType: SplitMethod | null = null
  title: string | null = null
  totalAmount: string | null = null
  amountPerUser: string | null = null
  timestamp: number | null = null

  constructor(args: SplitCreationContextArguments) {
    this.participants = args.participants ?? null
    this.paidById = args.paidById ?? null
    this.splitType = args.splitType ?? null
    this.title = args.title ?? null
    this.totalAmount = args.totalAmount ?? null
    this.amountPerUser = args.amountPerUser ?? null
    this.timestamp = args.timestamp ?? null
  }

  get paidByIndex(): number | undefined {
    if (this.participants === null || this.paidById === null) {
      return undefined
    }

    const index = this.participants.findIndex((participant) => {
      return participant.user.id === this.paidById
    })

    return index === -1 ? undefined : index
  }

  private getParticipantsData(): UserWithBalanceChange[] {
    if (this.participants === null) {
      return []
    }

    const users = this.participants.map((participant) => {
      return participant.user
    })

    if (this.splitType === SplitMethod.Equal) {
      if (this.amountPerUser !== null) {
        const amount = Number(this.amountPerUser).toFixed(2)

        this.participants.forEach((participant) => {
          participant.value = amount
        })
      } else if (this.totalAmount !== null) {
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
      } else {
        throw new TranslatableError('splitValidation.amountRequired')
      }
    }

    return users.map((user, index) => {
      const amount = this.participants![index].value!
      const change =
        user.id === this.paidById ? Number(this.totalAmount) - Number(amount) : -Number(amount)

      return {
        ...user,
        change: change.toFixed(2),
      }
    })
  }

  private tryFillMissingData() {
    if (
      this.participants &&
      this.splitType === SplitMethod.Equal &&
      !this.totalAmount &&
      this.amountPerUser !== null
    ) {
      this.totalAmount = (Number(this.amountPerUser) * this.participants.length).toFixed(2)
    }
  }

  buildSplitPreview(): SplitWithUsers {
    this.tryFillMissingData()
    const users = this.getParticipantsData()
    const paidById = this.paidById

    if (!paidById) {
      throw new TranslatableError('splitValidation.payerNotFound')
    }

    if (!this.title) {
      throw new TranslatableError('splitValidation.titleIsRequired')
    }

    if (!this.totalAmount) {
      throw new TranslatableError('splitValidation.amountRequired')
    }

    if (!auth.currentUser) {
      throw new TranslatableError('api.mustBeLoggedIn')
    }

    if (!this.timestamp) {
      throw new TranslatableError('splitValidation.dateMustBeSelected')
    }

    return {
      id: -1,
      title: this.title,
      total: this.totalAmount,
      timestamp: this.timestamp,
      paidById: paidById,
      version: 1,
      createdById: auth.currentUser.uid,
      updatedAt: Date.now(),
      isUserParticipating: true,
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
