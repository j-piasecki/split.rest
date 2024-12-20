import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups, updateCachedGroup } from '@utils/queryClient'
import { SetGroupHiddenArguments } from 'shared'

async function setGroupHidden(groupId: number, hidden: boolean) {
  const args: SetGroupHiddenArguments = { groupId, hidden }

  await makeRequest('POST', 'setGroupHidden', args)

  await updateCachedGroup(groupId, (info) => ({ ...info, hidden }))
  await invalidateUserGroups()
}

export function useSetGroupHiddenMutation(groupId: number) {
  return useMutation({
    mutationFn: (hidden: boolean) => setGroupHidden(groupId, hidden),
  })
}
