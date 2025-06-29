import { SplitQueryConfig } from '@utils/splitQueryConfig'
import { useReducer } from 'react'
import { SplitQuery, UserWithDisplayName } from 'shared'

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
      participant: UserWithDisplayName
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
      orderBy: 'title' | 'createdAt' | 'total' | 'balanceChange' | 'updatedAt'
    }
  | {
      type: 'setOrderDirection'
      orderDirection: 'asc' | 'desc'
    }
  | {
      type: 'addPaidBy'
      participant: UserWithDisplayName
    }
  | {
      type: 'removePaidBy'
      id: string
    }
  | {
      type: 'addLastUpdateBy'
      participant: UserWithDisplayName
    }
  | {
      type: 'removeLastUpdateBy'
      id: string
    }
  | {
      type: 'setBeforeTimestamp'
      beforeTimestamp: number
    }
  | {
      type: 'setAfterTimestamp'
      afterTimestamp: number
    }
  | {
      type: 'setLastUpdateBeforeTimestamp'
      lastUpdateBeforeTimestamp: number
    }
  | {
      type: 'setLastUpdateAfterTimestamp'
      lastUpdateAfterTimestamp: number
    }
  | {
      type: 'setEdited'
      edited: boolean | undefined
    }
  | {
      type: 'setPending'
      pending: boolean | undefined
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

  if (participants) {
    result.participants =
      participantsMode !== undefined
        ? { type: participantsMode, ids: participants.map((p) => p.id) }
        : undefined
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

  return result
}
