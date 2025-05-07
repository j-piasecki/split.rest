import { auth } from './firebase'
import {
  SplitType,
  SplitWithUsers,
  TranslatableError,
  UserWithDisplayName,
  UserWithPendingBalanceChange,
} from 'shared'

interface UserWithValue {
  user: UserWithDisplayName
  value?: string
}

export enum SplitMethod {
  ExactAmounts = 'exactAmounts',
  Equal = 'equal',
  BalanceChanges = 'balanceChanges',
}

export interface SplitCreationContextArguments {
  participants?: UserWithValue[]
  paidById?: string
  splitMethod?: SplitMethod
  title?: string
  totalAmount?: string
  amountPerUser?: string
  timestamp?: number
  splitType?: number
}

class SplitCreationContext {
  participants: UserWithValue[] | null = null
  paidById: string | null = null
  splitMethod: SplitMethod | null = null
  title: string | null = null
  totalAmount: string | null = null
  amountPerUser: string | null = null
  timestamp: number | null = null
  splitType: number | null = null

  constructor(args: SplitCreationContextArguments) {
    this.participants = args.participants ?? null
    this.paidById = args.paidById ?? null
    this.splitMethod = args.splitMethod ?? null
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

  private getParticipantsData(): UserWithPendingBalanceChange[] {
    if (this.participants === null) {
      return []
    }

    const users = this.participants.map((participant) => {
      return participant.user
    })

    if (this.splitMethod === SplitMethod.Equal) {
      if (this.amountPerUser !== null) {
        const amount = Number(this.amountPerUser).toFixed(2)

        this.participants.forEach((participant) => {
          participant.value = amount
        })
      } else if (this.totalAmount !== null) {
        const totalInCents = Math.floor(Number(this.totalAmount) * 100)
        const baseAmount = Math.floor(totalInCents / users.length)
        const remainder = totalInCents - baseAmount * users.length

        this.participants.forEach((participant, index) => {
          const amount = index < remainder ? baseAmount + 1 : baseAmount
          participant.value = (amount / 100).toFixed(2)
        })

        if (this.participants.some((participant) => Number(participant.value) <= 0)) {
          throw new TranslatableError('splitValidation.tooLittleToDivide')
        }
      } else {
        throw new TranslatableError('splitValidation.amountRequired')
      }
    }

    if (this.splitMethod === SplitMethod.BalanceChanges) {
      return users.map((user, index) => {
        return {
          ...user,
          change: Number(this.participants![index].value!).toFixed(2),
          pending: false,
        }
      })
    }

    return users.map((user, index) => {
      const amount = this.participants![index].value!
      const change =
        user.id === this.paidById ? Number(this.totalAmount) - Number(amount) : -Number(amount)

      return {
        ...user,
        change: change.toFixed(2),
        pending: false,
      }
    })
  }

  private tryFillMissingData() {
    if (
      this.participants &&
      this.splitMethod === SplitMethod.Equal &&
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

    if (!paidById && this.splitType !== SplitType.BalanceChange) {
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

    if (this.splitType === null) {
      throw new TranslatableError('splitValidation.typeRequired')
    } else if (this.splitType !== SplitType.Normal && this.splitType !== SplitType.BalanceChange) {
      throw new TranslatableError('splitValidation.invalidType')
    }

    return {
      id: -1,
      title: this.title,
      total: this.totalAmount,
      timestamp: this.timestamp,
      paidById: paidById ?? undefined,
      version: 1,
      createdById: auth.currentUser.uid,
      updatedAt: Date.now(),
      isUserParticipating: true,
      type: this.splitType,
      users: users,
      pending: false,
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
