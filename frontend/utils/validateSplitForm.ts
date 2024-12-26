import { FormData } from '@components/SplitForm'
import { getUserByEmail } from '@database/getUserByEmail'
import { BalanceChange, TranslatableError } from 'shared'

export interface ValidationResult {
  payerId: string
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

export async function validateSplitForm({
  title,
  paidByIndex,
  entries,
  timestamp,
}: FormData): Promise<ValidationResult> {
  if (entries.length < 2) {
    throw new TranslatableError('splitValidation.atLeastTwoEntries')
  }

  for (const { email, amount } of entries) {
    if (email === '' && amount === '') {
      continue
    }

    if (email === '' || amount === '') {
      throw new TranslatableError('splitValidation.youNeedToFillBothFields')
    }
  }

  const paidBy = entries[paidByIndex].email
  const sumToSave = entries.reduce((acc, entry) => acc + Number(entry.amount), 0)

  if (Number.isNaN(sumToSave)) {
    throw new TranslatableError('splitValidation.amountsMustBeNumbers')
  }

  if (sumToSave < 0.01) {
    throw new TranslatableError('splitValidation.totalMustBeGreaterThanZero')
  }

  validateSplitTitle(title)

  if (entries.find((entry) => entry.email === paidBy) === undefined) {
    throw new TranslatableError('splitValidation.thePayerDataMustBeFilledIn')
  }

  const emails = entries.map((entry) => entry.email)
  if (new Set(emails).size !== emails.length) {
    throw new TranslatableError('splitValidation.duplicateEmailsAreNotAllowed')
  }

  let payerId: string | undefined

  const balanceChange: (BalanceChange | undefined)[] = await Promise.all(
    entries.map(async (entry) => {
      const change =
        entry.email === paidBy ? sumToSave - Number(entry.amount) : -Number(entry.amount)
      const userData = await getUserByEmail(entry.email)

      if (!userData) {
        throw new TranslatableError('splitValidation.userWithEmailNotFound', { email: entry.email })
      }

      if (Number(entry.amount) <= 0) {
        throw new TranslatableError('splitValidation.amountsMustBePositive')
      }

      if (entry.email === paidBy) {
        payerId = userData.id
      }

      return {
        id: userData.id,
        change: change.toFixed(2),
      }
    })
  )

  if (balanceChange.findIndex((change) => change === undefined) !== -1) {
    throw new TranslatableError('splitValidation.userNotFound')
  }

  if (!payerId) {
    throw new TranslatableError('splitValidation.payerNotFound')
  }

  return {
    payerId,
    balanceChange: balanceChange.filter((change) => change !== undefined),
    sumToSave,
    timestamp,
  }
}
