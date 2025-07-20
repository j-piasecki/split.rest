import { SplitCreationContext, SplitMethod } from './splitCreationContext'
import { Router } from 'expo-router'

export function navigateToSplitSpecificFlow(groupId: number, router: Router) {
  switch (SplitCreationContext.current.splitMethod) {
    case SplitMethod.ExactAmounts:
      router.navigate(`/group/${groupId}/addSplit/exactAmounts`)
      break

    case SplitMethod.Equal:
      router.navigate(`/group/${groupId}/addSplit/participantsStep`)
      break

    case SplitMethod.BalanceChanges:
      router.navigate(`/group/${groupId}/addSplit/balanceChanges`)
      break

    case SplitMethod.Lend:
      router.navigate(`/group/${groupId}/addSplit/lend`)
      break

    case SplitMethod.Delayed:
      router.navigate(`/group/${groupId}/addSplit/summary`)
      break
  }
}
