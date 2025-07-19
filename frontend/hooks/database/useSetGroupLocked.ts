import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups, updateCachedGroup } from '@utils/queryClient'
import { SetGroupLockedArguments } from 'shared'

async function setGroupLocked(groupId: number, locked: boolean) {
  const args: SetGroupLockedArguments = { groupId, locked }

  await makeRequest('POST', 'setGroupLocked', args)

  await updateCachedGroup(groupId, (group) => ({ ...group, locked }))
  await invalidateUserGroups()
}

export function useSetGroupLockedMutation(groupId: number) {
  return useMutation({
    mutationFn: (locked: boolean) => setGroupLocked(groupId, locked),
  })
}
