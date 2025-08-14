import { SplitQueryConfig } from '@utils/splitQueryConfig'
import { useReducer } from 'react'
import { Member, SplitQuery, SplitType } from 'shared'

export type SplitQueryActionType =
  | {
      type: 'setTitle'
      title: string | undefined
    }
  | {
      type: 'setCaseSensitive'
      caseSensitive: boolean
    }
  | {
      type: 'setRegex'
      regex: boolean
    }
  | {
      type: 'addParticipant'
      participant: Member
    }
  | {
      type: 'removeParticipant'
      id: string
    }
  | {
      type: 'setParticipantsMode'
      participantsMode: 'all' | 'oneOf'
    }
  | {
      type: 'setOrderBy'
      orderBy: 'timestamp' | 'createdAt' | 'total' | 'balanceChange' | 'updatedAt'
    }
  | {
      type: 'setOrderDirection'
      orderDirection: 'asc' | 'desc'
    }
  | {
      type: 'addPaidBy'
      participant: Member
    }
  | {
      type: 'removePaidBy'
      id: string
    }
  | {
      type: 'addLastUpdateBy'
      participant: Member
    }
  | {
      type: 'removeLastUpdateBy'
      id: string
    }
  | {
      type: 'setBeforeTimestamp'
      beforeTimestamp: number | undefined
    }
  | {
      type: 'setAfterTimestamp'
      afterTimestamp: number | undefined
    }
  | {
      type: 'setLastUpdateBeforeTimestamp'
      lastUpdateBeforeTimestamp: number | undefined
    }
  | {
      type: 'setLastUpdateAfterTimestamp'
      lastUpdateAfterTimestamp: number | undefined
    }
  | {
      type: 'setEdited'
      edited: boolean | undefined
    }
  | {
      type: 'setPending'
      pending: boolean | undefined
    }
  | {
      type: 'toggleSplitType'
      splitType: SplitType
    }

function queryReducer(query: SplitQueryConfig, action: SplitQueryActionType): SplitQueryConfig {
  const newQuery = { ...query }

  switch (action.type) {
    case 'setTitle':
      newQuery.titleFilter = action.title
      break
    case 'setCaseSensitive':
      newQuery.titleCaseSensitive = action.caseSensitive
      break
    case 'setRegex':
      newQuery.titleRegex = action.regex
      break
    case 'addParticipant':
      newQuery.participants = [...(newQuery.participants || []), action.participant]
      break
    case 'removeParticipant':
      newQuery.participants = newQuery.participants?.filter((p) => p.id !== action.id)
      break
    case 'setParticipantsMode':
      newQuery.participantsMode = action.participantsMode
      break
    case 'setOrderBy':
      newQuery.orderBy = action.orderBy
      break
    case 'setOrderDirection':
      newQuery.orderDirection = action.orderDirection
      break
    case 'addPaidBy':
      newQuery.paidBy = [...(newQuery.paidBy || []), action.participant]
      break
    case 'removePaidBy':
      newQuery.paidBy = newQuery.paidBy?.filter((p) => p.id !== action.id)
      break
    case 'addLastUpdateBy':
      newQuery.lastUpdateBy = [...(newQuery.lastUpdateBy || []), action.participant]
      break
    case 'removeLastUpdateBy':
      newQuery.lastUpdateBy = newQuery.lastUpdateBy?.filter((p) => p.id !== action.id)
      break
    case 'setBeforeTimestamp':
      newQuery.beforeTimestamp = action.beforeTimestamp
      break
    case 'setAfterTimestamp':
      newQuery.afterTimestamp = action.afterTimestamp
      break
    case 'setLastUpdateBeforeTimestamp':
      newQuery.lastUpdateBeforeTimestamp = action.lastUpdateBeforeTimestamp
      break
    case 'setLastUpdateAfterTimestamp':
      newQuery.lastUpdateAfterTimestamp = action.lastUpdateAfterTimestamp
      break
    case 'setEdited':
      newQuery.edited = action.edited
      break
    case 'setPending':
      newQuery.pending = action.pending
      break
    case 'toggleSplitType':
      if (newQuery.splitTypes?.includes(action.splitType)) {
        newQuery.splitTypes = newQuery.splitTypes?.filter((t) => t !== action.splitType)

        if (action.splitType === SplitType.SettleUp) {
          newQuery.splitTypes = newQuery.splitTypes?.filter(
            (t) => t !== (SplitType.SettleUp | SplitType.Inversed)
          )
        }
      } else {
        newQuery.splitTypes = [...(newQuery.splitTypes || []), action.splitType]

        if (action.splitType === SplitType.SettleUp) {
          newQuery.splitTypes = [
            ...(newQuery.splitTypes || []),
            SplitType.SettleUp | SplitType.Inversed,
          ]
        }
      }
      break
  }

  return newQuery
}

export function useSplitQueryConfigBuilder(initial: SplitQueryConfig) {
  const [query, updateQuery] = useReducer<SplitQueryConfig, [SplitQueryActionType]>(
    queryReducer,
    initial
  )
  return [query, updateQuery] as const
}

export function buildQuery(query: SplitQueryConfig): SplitQuery {
  const {
    titleFilter,
    titleCaseSensitive,
    titleRegex,
    participants,
    participantsMode,
    orderBy,
    orderDirection,
    paidBy,
    lastUpdateBy,
    beforeTimestamp,
    afterTimestamp,
    lastUpdateBeforeTimestamp,
    lastUpdateAfterTimestamp,
    edited,
    pending,
    splitTypes,
  } = query

  const result: SplitQuery = {
    orderBy,
    orderDirection,
  }

  if (titleFilter) {
    result.title = {
      type: titleRegex ? 'regex' : 'contains',
      filter: titleFilter,
      caseSensitive: titleCaseSensitive,
    }
  }

  if (participants && participants.length > 0) {
    result.participants = { type: participantsMode ?? 'oneOf', ids: participants.map((p) => p.id) }
  }

  if (paidBy) {
    result.paidBy = paidBy.map((p) => p.id)
  }

  if (lastUpdateBy) {
    result.lastUpdateBy = lastUpdateBy.map((p) => p.id)
  }

  if (beforeTimestamp) {
    result.beforeTimestamp = beforeTimestamp
  }

  if (afterTimestamp) {
    result.afterTimestamp = afterTimestamp
  }

  if (lastUpdateBeforeTimestamp) {
    result.lastUpdateBeforeTimestamp = lastUpdateBeforeTimestamp
  }

  if (lastUpdateAfterTimestamp) {
    result.lastUpdateAfterTimestamp = lastUpdateAfterTimestamp
  }

  if (edited !== undefined) {
    result.edited = edited
  }

  if (pending !== undefined) {
    result.pending = pending
  }

  if (splitTypes) {
    result.splitTypes = splitTypes
  }

  return result
}
