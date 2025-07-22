import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupSettings } from '@utils/queryClient'
import { SetAllowedSplitMethodsArguments, SplitMethod } from 'shared'

async function setGroupAllowedSplitMethods(groupId: number, allowedSplitMethods: SplitMethod[]) {
  const args: SetAllowedSplitMethodsArguments = { groupId, allowedSplitMethods }

  await makeRequest('POST', 'setGroupAllowedSplitMethods', args)

  await invalidateGroupSettings(groupId)
}

export function useSetGroupAllowedSplitMethodsMutation(groupId: number) {
  return useMutation({
    mutationFn: (allowedSplitMethods: SplitMethod[]) =>
      setGroupAllowedSplitMethods(groupId, allowedSplitMethods),
  })
}
