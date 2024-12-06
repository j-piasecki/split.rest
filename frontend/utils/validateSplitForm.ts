import { FormData } from '@components/SplitForm'
import { getUserByEmail } from '@database/getUserByEmail'
import { BalanceChange } from 'shared'

export interface ValidationResult {
  payerId: string
  balanceChange: BalanceChange[]
  sumToSave: number
}

export async function validateSplitForm({
  title,
  paidBy,
  entries,
}: FormData): Promise<ValidationResult> {
  if (entries.length < 2) {
    throw 'At least two entries are required'
  }

  for (const { email, amount } of entries) {
    if (email === '' && amount === '') {
      continue
    }

    if (email === '' || amount === '') {
      throw 'You need to fill both fields in the row'
    }
  }

  const sumToSave = entries.reduce((acc, entry) => acc + Number(entry.amount), 0)

  if (Number.isNaN(sumToSave)) {
    throw 'Amounts must be numbers'
  }

  if (sumToSave < 0.01) {
    throw 'Total must be greater than 0'
  }

  if (!title) {
    throw 'Title is required'
  }

  if (title.length > 512) {
    throw 'Title is too long'
  }

  if (entries.find((entry) => entry.email === paidBy) === undefined) {
    throw 'The payer data must be filled in'
  }

  const emails = entries.map((entry) => entry.email)
  if (new Set(emails).size !== emails.length) {
    throw 'Duplicate e-mails are not allowed'
  }

  let payerId: string | undefined

  const balanceChange: (BalanceChange | undefined)[] = await Promise.all(
    entries.map(async (entry) => {
      const change =
        entry.email === paidBy ? sumToSave - Number(entry.amount) : -Number(entry.amount)
      const userData = await getUserByEmail(entry.email)

      if (!userData) {
        throw 'User ' + entry.email + ' not found'
      }

      if (Number(entry.amount) < 0) {
        throw 'Amounts cannot be negative'
      }

      if (entry.email === paidBy) {
        payerId = userData.id
      }

      return {
        id: userData.id,
        change: change,
      }
    })
  )

  if (balanceChange.findIndex((change) => change === undefined) !== -1) {
    throw 'User not found'
  }

  if (!payerId) {
    throw 'Payer not found'
  }

  return {
    payerId,
    balanceChange: balanceChange.filter((change) => change !== undefined),
    sumToSave,
  }
}
