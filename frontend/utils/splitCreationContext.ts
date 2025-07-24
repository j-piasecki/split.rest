import { auth } from './firebase'
import { createSplit } from '@hooks/database/useCreateSplit'
import { resolveSplit } from '@hooks/database/useResolveSplit'
import currency from 'currency.js'
import {
  CreateSplitArguments,
  SplitMethod,
  SplitType,
  SplitWithUsers,
  TranslatableError,
  UserWithDisplayName,
  UserWithPendingBalanceChange,
} from 'shared'

export interface UserWithValue {
  user: UserWithDisplayName
  value?: string
}

export enum FlowMode {
  Create = 'create',
  Resolve = 'resolve',
}

export interface SplitCreationContextArguments {
  allowedSplitMethods?: SplitMethod[]
  flowMode?: FlowMode
  participants?: UserWithValue[]
  paidById?: string
  splitMethod?: SplitMethod
  title?: string
  totalAmount?: string
  amountPerUser?: string
  timestamp?: number
  splitType?: number
  resolveSplitId?: number
}

export const AllSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.Shares,
  SplitMethod.BalanceChanges,
  SplitMethod.Lend,
  SplitMethod.Delayed,
]

export class SplitCreationContext {
  private _allowedSplitMethods: SplitMethod[] = [...AllSplitMethods]

  private _participants: UserWithValue[] | null = null
  private _paidById: string | null = null
  private _splitMethod: SplitMethod | null = null
  private _title: string | null = null
  private _totalAmount: string | null = null
  private _amountPerUser: string | null = null
  private _timestamp: number | null = null
  private _splitType: number | null = null
  private _resolveSplitId: number | null = null

  private flowMode: FlowMode = FlowMode.Create
  private started: boolean = false
  private completed: boolean = false

  get paidByIndex(): number | undefined {
    if (this._participants === null || this._paidById === null) {
      return undefined
    }

    const index = this._participants.findIndex((participant) => {
      return participant.user.id === this._paidById
    })

    return index === -1 ? undefined : index
  }

  private getParticipantsData(): UserWithPendingBalanceChange[] {
    if (this._participants === null) {
      return []
    }

    const users = this._participants.map((participant) => {
      return participant.user
    })

    if (this._splitMethod === SplitMethod.Equal) {
      if (this._amountPerUser !== null) {
        const amount = Number(this._amountPerUser).toFixed(2)

        this._participants.forEach((participant) => {
          participant.value = amount
        })
      } else if (this._totalAmount !== null) {
        const distribution = currency(this._totalAmount, { precision: 2 }).distribute(
          this._participants.length
        )
        this._participants.forEach((participant, index) => {
          participant.value = distribution[index].toString()
        })

        if (this._participants.some((participant) => Number(participant.value) <= 0)) {
          throw new TranslatableError('splitValidation.tooLittleToDivide')
        }
      } else {
        throw new TranslatableError('splitValidation.amountRequired')
      }
    }

    if (this._splitMethod === SplitMethod.BalanceChanges) {
      return users.map((user, index) => {
        return {
          ...user,
          change: Number(this._participants![index].value!).toFixed(2),
          pending: false,
        }
      })
    }

    if (this._splitMethod === SplitMethod.Shares) {
      if (this._totalAmount === null) {
        throw new TranslatableError('splitValidation.amountRequired')
      }

      const totalAmount = currency(this._totalAmount, { precision: 2 })
      const totalShares = this._participants.reduce((acc, participant) => {
        return acc + Math.floor(Number(participant.value))
      }, 0)

      if (totalShares === 0) {
        throw new TranslatableError('splitValidation.tooLittleToDivide')
      }

      // Calculate exact amounts for each participant
      const exactAmounts = this._participants.map((participant) => {
        const shares = Math.floor(Number(participant.value))
        return totalAmount.multiply(shares).divide(totalShares)
      })

      // Round amounts and calculate remainder
      const roundedAmounts = exactAmounts.map((amount) => currency(amount.value, { precision: 2 }))
      const totalRounded = roundedAmounts.reduce((sum, amount) => sum.add(amount), currency(0))
      const remainder = totalAmount.subtract(totalRounded)

      // Distribute the remainder (due to rounding) to participants with the largest fractional parts
      if (remainder.intValue !== 0) {
        const fractionalParts = exactAmounts.map((exact, index) => ({
          index,
          fractional: exact.subtract(roundedAmounts[index]).value,
        }))

        // Sort by fractional part (descending) to give remainder to those with largest fractions
        fractionalParts.sort((a, b) => Math.abs(b.fractional) - Math.abs(a.fractional))

        // Distribute the remainder one cent at a time
        let remainingCents = Math.abs(remainder.intValue)
        const centAdjustment = remainder.intValue > 0 ? currency(0.01) : currency(-0.01)

        for (let i = 0; i < fractionalParts.length && remainingCents > 0; i++) {
          const participantIndex = fractionalParts[i].index
          roundedAmounts[participantIndex] = roundedAmounts[participantIndex].add(centAdjustment)
          remainingCents--
        }
      }

      // Assign the calculated amounts back to participants
      this._participants.forEach((participant, index) => {
        participant.value = roundedAmounts[index].toString()
      })
    }

    if (this._splitMethod === SplitMethod.Delayed) {
      return users.map((user) => {
        return {
          ...user,
          change: '0.00',
          pending: false,
        }
      })
    }

    return users.map((user, index) => {
      const amount = this._participants![index].value!
      const change =
        user.id === this._paidById ? Number(this._totalAmount) - Number(amount) : -Number(amount)

      return {
        ...user,
        change: change.toFixed(2),
        pending: false,
      }
    })
  }

  private tryFillMissingData() {
    if (
      this._participants &&
      this._splitMethod === SplitMethod.Equal &&
      !this._totalAmount &&
      this._amountPerUser !== null
    ) {
      this._totalAmount = (Number(this._amountPerUser) * this._participants.length).toFixed(2)
    }
  }

  async saveSplit(args: CreateSplitArguments) {
    if (this.completed) {
      throw new Error('Current split creation context is completed')
    }

    if (this.flowMode === FlowMode.Resolve) {
      const splitId = this._resolveSplitId

      if (splitId === null) {
        throw new TranslatableError('splitValidation.resolveSplitNotFound')
      }

      await resolveSplit({
        ...args,
        splitId,
      })
    } else {
      await createSplit(args)
    }

    this.completed = true
  }

  buildSplitPreview(): SplitWithUsers {
    this.tryFillMissingData()
    const users = this.getParticipantsData()
    const paidById = this._paidById

    if (!paidById && this._splitType !== SplitType.BalanceChange) {
      throw new TranslatableError('splitValidation.payerNotFound')
    }

    if (!this._title) {
      throw new TranslatableError('splitValidation.titleIsRequired')
    }

    if (!this._totalAmount) {
      throw new TranslatableError('splitValidation.amountRequired')
    }

    if (!auth.currentUser) {
      throw new TranslatableError('api.mustBeLoggedIn')
    }

    if (!this._timestamp) {
      throw new TranslatableError('splitValidation.dateMustBeSelected')
    }

    if (this._splitType === null) {
      throw new TranslatableError('splitValidation.typeRequired')
    } else if (
      this._splitType !== SplitType.Normal &&
      this._splitType !== SplitType.BalanceChange &&
      this._splitType !== SplitType.Lend &&
      this._splitType !== SplitType.Delayed
    ) {
      throw new TranslatableError('splitValidation.invalidType')
    }

    return {
      id: -1,
      title: this._title,
      total: this._totalAmount,
      timestamp: this._timestamp,
      paidById: paidById ?? undefined,
      version: 1,
      createdById: auth.currentUser.uid,
      updatedAt: Date.now(),
      isUserParticipating: true,
      type: this._splitType,
      users: users,
      pending: false,
    }
  }

  shouldSkipDetailsStep(): boolean {
    return this.flowMode === FlowMode.Resolve
  }

  get allowedSplitMethods(): SplitMethod[] {
    return this._allowedSplitMethods
  }

  get splitMethod(): SplitMethod {
    if (this._splitMethod === null) {
      throw new Error('Split method is not set')
    }

    return this._splitMethod
  }

  get participants(): UserWithValue[] | null {
    return this._participants
  }

  get title(): string | null {
    return this._title
  }

  get totalAmount(): string | null {
    return this._totalAmount
  }

  get amountPerUser(): string | null {
    return this._amountPerUser
  }

  get timestamp(): number | null {
    return this._timestamp
  }

  setSplitMethod(splitMethod: SplitMethod) {
    this._splitMethod = splitMethod

    this._splitType =
      splitMethod === SplitMethod.BalanceChanges
        ? SplitType.BalanceChange
        : splitMethod === SplitMethod.Lend
          ? SplitType.Lend
          : splitMethod === SplitMethod.Delayed
            ? SplitType.Delayed
            : SplitType.Normal

    return this
  }

  setParticipants(participants: UserWithValue[]) {
    this._participants = participants
    return this
  }

  setPaidById(paidById: string | null) {
    this._paidById = paidById
    return this
  }

  setTitle(title: string) {
    this._title = title
    return this
  }

  setTotalAmount(totalAmount: string | null) {
    this._totalAmount = totalAmount
    return this
  }

  setAmountPerUser(amountPerUser: string | null) {
    this._amountPerUser = amountPerUser
    return this
  }

  setTimestamp(timestamp: number) {
    this._timestamp = timestamp
    return this
  }

  private static currentContext: SplitCreationContext | null = null
  static get current(): SplitCreationContext {
    if (!this.currentContext) {
      throw new Error('No split creation context found')
    }

    return this.currentContext
  }

  static create() {
    this.currentContext = new SplitCreationContext()
    return this.currentContext
  }

  private assertNotStarted() {
    if (this.started) {
      throw new Error('Split creation context is already started')
    }
  }

  begin() {
    this.started = true
  }

  setAllowedSplitMethods(methods: SplitMethod[]) {
    this.assertNotStarted()
    this._allowedSplitMethods = methods
    return this
  }

  resolveDelayedSplit(splitId: number) {
    this.assertNotStarted()
    this.flowMode = FlowMode.Resolve
    this._resolveSplitId = splitId
    return this
  }
}
