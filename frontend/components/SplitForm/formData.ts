import React, { useReducer } from 'react'
import { User } from 'shared'

export interface SplitEntryData {
  email: string
  amount: string
  user?: User
}

export interface FormData {
  title: string
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

    case 'clearFocusOnMount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, focusOnMount: false } : entry
      )

      return newState

    case 'setUser':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, user: action.user } : entry
      )

      if (action.user) {
        newState.entries[action.index].email = action.user.email
      }
      return newState

    case 'remove':
      newState.entries = newState.entries.filter((_, i) => i !== action.index)
      break

    case 'setEmail':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, email: action.email } : entry
      )
      break

    case 'setAmount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, amount: action.amount } : entry
      )
      break
  }

  newState.entries = newState.entries.filter((entry) => entry.email !== '' || entry.amount !== '')

  if (
    newState.entries.length === 0 ||
    newState.entries[newState.entries.length - 1].email !== '' ||
    newState.entries[newState.entries.length - 1].amount !== ''
  ) {
    newState.entries.push({ email: '', amount: '' })
  }

  if (state.entries.length !== newState.entries.length) {
    const newPaidByIndex = newState.entries.findIndex((entry) => entry.email === paidBy.email)
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
