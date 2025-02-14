import { FormData } from '@components/SplitForm'
import { BalanceChange, TranslatableError } from 'shared'

export interface ValidationResult {
  payerId: string | undefined
  balanceChange: BalanceChange[]
  sumToSave: number
  timestamp: number
}

export function validateSplitTitle(title: string): void {
  if (!title) {
    throw new TranslatableError('splitValidation.titleIsRequired')
  }

  if (title.length > 512) {
    throw new TranslatableError('splitValidation.titleIsTooLong')
  }
}

export async function validateSplitForm(
  { title, paidByIndex, entries, timestamp }: FormData,
  singlePayer = true,
  requirePositiveValues = true
): Promise<ValidationResult> {
  if (entries.length < 2) {
    throw new TranslatableError('splitValidation.atLeastTwoEntries')
  }

  for (const { entry, user, amount } of entries) {
    if (user === undefined && entry === '' && amount === '') {
      continue
    }

    if (user === undefined || amount === '') {
      throw new TranslatableError('splitValidation.youNeedToFillBothFields')
    }
  }

  const entriesWithUsers = entries
    .filter((entry) => entry.user !== undefined)
    .map((entry) => ({
      user: entry.user!,
      amount: entry.amount,
    }))

  if (entriesWithUsers.length !== entries.length) {
    throw new TranslatableError('splitValidation.youNeedToFillBothFields')
  }

  const paidBy = entriesWithUsers[paidByIndex]?.user
  const sumToSave = entries.reduce((acc, entry) => acc + Math.max(0, Number(entry.amount)), 0)

  if (Number.isNaN(sumToSave)) {
    throw new TranslatableError('splitValidation.amountsMustBeNumbers')
  }

  if (sumToSave < 0.01) {
    throw new TranslatableError('splitValidation.amountMustBeGreaterThanZero')
  }

  validateSplitTitle(title)

  if (!paidBy && singlePayer) {
    throw new TranslatableError('splitValidation.thePayerDataMustBeFilledIn')
  }

  const emails = entriesWithUsers.map((entry) => entry.user.email)
  if (new Set(emails).size !== emails.length) {
    throw new TranslatableError('splitValidation.entriesMustBeUnique')
  }

  const balanceChange: (BalanceChange | undefined)[] = await Promise.all(
    entriesWithUsers.map(async (entry) => {
      const change = singlePayer
        ? entry.user.id === paidBy.id
          ? sumToSave - Number(entry.amount)
          : -Number(entry.amount)
        : Number(entry.amount)

      if (Number(entry.amount) <= 0 && requirePositiveValues) {
        throw new TranslatableError('splitValidation.amountsMustBePositive')
      }

      return {
        id: entry.user.id,
        change: change.toFixed(2),
      }
    })
  )

  if (balanceChange.findIndex((change) => change === undefined) !== -1) {
    throw new TranslatableError('splitValidation.userNotFound')
  }

  return {
    payerId: paidBy?.id,
    balanceChange: balanceChange.filter((change) => change !== undefined),
    sumToSave,
    timestamp,
  }
}
