import React, { useReducer } from 'react'
import { User } from 'shared'

export interface SplitEntryData {
  userOrEmail: string | User
  amount: string
}

export interface FormData {
  title: string
  timestamp: number
  paidByIndex: number
  entries: SplitEntryData[]
}

export type FormActionType =
  | {
      type: 'setEmail'
      index: number
      email: string
    }
  | {
      type: 'setAmount'
      index: number
      amount: string
    }
  | {
      type: 'remove'
      index: number
    }
  | {
      type: 'setUser'
      index: number
      user: User | undefined
    }
  | {
      type: 'setPaidBy'
      index: number
    }
  | {
      type: 'setTitle'
      title: string
    }
  | {
      type: 'clearFocusOnMount'
      index: number
    }
  | {
      type: 'setTimestamp'
      timestamp: number
    }

function entriesReducer(state: FormData, action: FormActionType): FormData {
  const newState = { ...state }
  const paidBy = newState.entries[newState.paidByIndex]

  switch (action.type) {
    case 'setTitle':
      newState.title = action.title
      return newState

    case 'setPaidBy':
      newState.paidByIndex = action.index
      return newState

    case 'setTimestamp':
      newState.timestamp = action.timestamp
      return newState

    case 'clearFocusOnMount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, focusOnMount: false } : entry
      )

      return newState

    case 'setUser':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index
          ? {
              ...entry,
              userOrEmail:
                action.user ??
                (typeof entry.userOrEmail === 'string'
                  ? entry.userOrEmail
                  : (entry.userOrEmail.email ?? '')),
            }
          : entry
      )
      console.log(newState.entries, action)
      return newState

    case 'remove':
      newState.entries = newState.entries.filter((_, i) => i !== action.index)
      break

    case 'setEmail':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, userOrEmail: action.email } : entry
      )
      break

    case 'setAmount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, amount: action.amount } : entry
      )
      break
  }

  newState.entries = newState.entries.filter(
    (entry) => entry.userOrEmail !== '' || entry.amount !== ''
  )

  if (
    newState.entries.length === 0 ||
    newState.entries[newState.entries.length - 1].userOrEmail !== '' ||
    newState.entries[newState.entries.length - 1].amount !== ''
  ) {
    newState.entries.push({ userOrEmail: '', amount: '' })
  }

  if (state.entries.length !== newState.entries.length) {
    const newPaidByIndex = newState.entries.findIndex(
      (entry) => entry.userOrEmail === paidBy.userOrEmail
    )
    newState.paidByIndex = newPaidByIndex === -1 ? 0 : newPaidByIndex
  }

  return newState
}

export function useFormData(initial: FormData) {
  return useReducer<React.Reducer<FormData, FormActionType>, FormData>(
    entriesReducer,
    {} as FormData,
    () => initial
  )
}
