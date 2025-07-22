import { SplitCreationContext } from './splitCreationContext'
import { Router } from 'expo-router'
import { SplitMethod } from 'shared'

export function navigateToSplitSpecificFlow(groupId: number, router: Router, replace?: boolean) {
  let path: string | null = null
  switch (SplitCreationContext.current.splitMethod) {
    case SplitMethod.ExactAmounts:
      path = `/group/${groupId}/addSplit/exactAmounts`
      break

    case SplitMethod.Equal:
      path = `/group/${groupId}/addSplit/participantsStep`
      break

    case SplitMethod.BalanceChanges:
      path = `/group/${groupId}/addSplit/balanceChanges`
      break

    case SplitMethod.Lend:
      path = `/group/${groupId}/addSplit/lend`
      break

    case SplitMethod.Delayed:
      path = `/group/${groupId}/addSplit/summary`
      break
  }

  if (path) {
    if (replace) {
      router.replace(path)
    } else {
      router.navigate(path)
    }
  }
}
