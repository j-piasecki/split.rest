import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { SplitMethod } from 'shared'

type Screen =
  | 'index'
  | 'detailsStep'
  | 'participantsStep'
  | 'payerStep'
  | 'exactAmounts'
  | 'shares'
  | 'balanceChanges'
  | 'lend'
  | 'summary'

const flows: Record<SplitMethod, Screen[]> = {
  [SplitMethod.Equal]: ['index', 'detailsStep', 'participantsStep', 'payerStep', 'summary'],
  [SplitMethod.Shares]: ['index', 'detailsStep', 'shares', 'payerStep', 'summary'],
  [SplitMethod.ExactAmounts]: ['index', 'detailsStep', 'exactAmounts', 'payerStep', 'summary'],
  [SplitMethod.BalanceChanges]: ['index', 'detailsStep', 'balanceChanges', 'summary'],
  [SplitMethod.Lend]: ['index', 'detailsStep', 'lend', 'summary'],
  [SplitMethod.Delayed]: ['index', 'detailsStep', 'summary'],
}

function getScreenFromPathname(pathname: string): Screen {
  const withoutTrailingSlash = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const lastSegment = withoutTrailingSlash.split('/').pop()
  return lastSegment === 'addSplit' ? 'index' : (lastSegment as Screen)
}

export function useSplitCreationFlow() {
  const pathname = usePathname()
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const navigateToNextScreen = useCallback(
    (options?: { replace?: boolean }) => {
      const context = SplitCreationContext.current
      let flow = flows[context.splitMethod]

      const currentScreen = getScreenFromPathname(pathname)
      const currentIndex = flow.indexOf(currentScreen)

      if (currentIndex === -1 || currentIndex >= flow.length - 1) {
        return
      }

      let nextScreen = flow[currentIndex + 1]

      if (context.shouldSkipDetailsStep() && nextScreen === 'detailsStep') {
        nextScreen = flow[currentIndex + 2]
      }

      if (!nextScreen) {
        throw new Error('No next screen found in split creation flow')
      }

      const path = `/group/${id}/addSplit/${nextScreen}`

      if (options?.replace) {
        router.replace(path)
      } else {
        router.navigate(path)
      }
    },
    [pathname, router, id]
  )

  return { navigateToNextScreen }
}
