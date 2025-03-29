import { useTranslatedError } from './useTranslatedError'
import { PersonEntry } from '@components/PeoplePicker'
import { getBalances } from '@database/getBalances'
import { sleep } from '@utils/sleep'
import { useEffect, useState } from 'react'
import { TranslatableError, UserWithDisplayName } from 'shared'

interface UserWithMaybeBalanceChange extends UserWithDisplayName {
  change: string | null
}

export function useRouletteQuery(groupId: number, query: PersonEntry[]) {
  const [finished, setFinished] = useState(false)
  const [error, setError] = useTranslatedError()
  const [result, setResult] = useState<UserWithMaybeBalanceChange[]>(
    query.map((user) => ({ ...user.user!, change: null }))
  )

  useEffect(() => {
    async function fetchBalances() {
      try {
        const startTime = Date.now()
        const response = await getBalances(
          groupId,
          query.map((entry) => entry.user!.id)
        )

        // Delay setting the result a bit so the animation is visible
        if (Date.now() - startTime < 500) {
          await sleep(500 - (Date.now() - startTime))
        }

        setResult(
          query
            .map((entry) => {
              const foundUser = response.find((u) => u.id === entry.user!.id)

              if (!foundUser) {
                throw new TranslatableError('splitValidation.userNotFound')
              }

              return {
                ...entry.user!,
                change: foundUser.change,
              }
            })
            .sort((a, b) => {
              const changeA = Number(a.change)
              const changeB = Number(b.change)

              return changeA - changeB
            })
        )
        setFinished(true)
      } catch (error) {
        setError(error)
      }
    }

    fetchBalances()
  }, [groupId, query, setError])

  return { error, result, finished }
}
