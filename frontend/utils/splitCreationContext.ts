import { User } from 'shared'

interface UserWithValue {
  userOrEmail: User | string
  value?: string
}

export interface SplitCreationContextArguments {
  participants?: UserWithValue[]
  paidByEmail?: string
}

class SplitCreationContext {
  participants: UserWithValue[] | null = null
  paidByEmail: string | null = null

  constructor(args: SplitCreationContextArguments) {
    this.participants = args.participants ?? null
    this.paidByEmail = args.paidByEmail ?? null
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
