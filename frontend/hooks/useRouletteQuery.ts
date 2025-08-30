import { useTranslatedError } from './useTranslatedError'
import { PersonEntry } from '@components/PeoplePicker'
import { getBalances } from '@database/getBalances'
import { HapticFeedback } from '@utils/hapticFeedback'
import { sleep } from '@utils/sleep'
import { useEffect, useMemo, useState } from 'react'
import { Member, TranslatableError } from 'shared'

export interface UserWithMaybeBalance extends Member {
  maybeBalance: string | null
}

export function useRouletteQuery(groupId: number, query: PersonEntry[]) {
  const [finished, setFinished] = useState(false)
  const [error, setError] = useTranslatedError()
  const initialOrder = useMemo(
    () => query.map((user) => ({ ...user.user!, maybeBalance: null })),
    [query]
  )
  const [result, setResult] = useState<(UserWithMaybeBalance | null)[]>([null, ...initialOrder])

  useEffect(() => {
    async function fetchBalances() {
      try {
        const startTime = performance.now()
        const response = await getBalances(
          groupId,
          query.map((entry) => entry.user!.id)
        )

        // Wait for 300ms to ensure the response is not too fast
        if (performance.now() - startTime < 400) {
          await sleep(300 - (performance.now() - startTime))
        }

        const result = query
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

        setResult([result[0], null, ...initialOrder.filter((user) => user.id !== result[0].id)])

        await HapticFeedback.rouletteFirst()
        if (initialOrder.length > 1) {
          await sleep(400)

          setResult([
            result[0],
            result[1],
            null,
            ...initialOrder.filter((user) => user.id !== result[0].id && user.id !== result[1].id),
          ])
          await HapticFeedback.rouletteSecond()
          if (initialOrder.length > 2) {
            await sleep(300)

            setResult([
              result[0],
              result[1],
              result[2],
              null,
              ...initialOrder.filter(
                (user) =>
                  user.id !== result[0].id && user.id !== result[1].id && user.id !== result[2].id
              ),
            ])
            await HapticFeedback.rouletteThird()
            if (initialOrder.length > 3) {
              await sleep(250)
            }
          }
        }

        const outsidePodium = result.slice(3)
        const initialOrderOutsidePodium = initialOrder.filter(
          (user) => user.id !== result[0].id && user.id !== result[1].id && user.id !== result[2].id
        )

        const pairs = outsidePodium.map((user, index) => [user, initialOrderOutsidePodium[index]])
        const orderChanged = pairs.some((pair) => pair[0].id !== pair[1].id)

        setResult([...result.slice(0, 3), null, ...outsidePodium])

        if (orderChanged) {
          await sleep(50)
          await HapticFeedback.rouletteRest()
        }

        setFinished(true)
      } catch (error) {
        setError(error)
      }
    }

    fetchBalances()
  }, [groupId, initialOrder, query, setError])

  return { error, result, finished }
}
