import { useTranslatedError } from './useTranslatedError'
import { PersonEntry } from '@components/PeoplePicker'
import { getBalances } from '@database/getBalances'
import { sleep } from '@utils/sleep'
import { useEffect, useState } from 'react'
import { Member, TranslatableError } from 'shared'

interface UserWithMaybeBalance extends Member {
  maybeBalance: string | null
}

export function useRouletteQuery(groupId: number, query: PersonEntry[]) {
  const [finished, setFinished] = useState(false)
  const [error, setError] = useTranslatedError()
  const [result, setResult] = useState<UserWithMaybeBalance[]>(
    query.map((user) => ({ ...user.user!, maybeBalance: null }))
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
                maybeBalance: foundUser.change,
              }
            })
            .sort((a, b) => {
              const changeA = Number(a.maybeBalance)
              const changeB = Number(b.maybeBalance)

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
