import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups, updateCachedGroup } from '@utils/queryClient'
import { SetGroupNameArguments } from 'shared'

async function setGroupName(groupId: number, name: string) {
  const args: SetGroupNameArguments = { groupId, name }

  await makeRequest('POST', 'setGroupName', args)

  await invalidateUserGroups()
  await updateCachedGroup(groupId, (member) => ({ ...member, name }))
}

export function useSetGroupNameMutation(groupId: number) {
  return useMutation({
    mutationFn: (name: string) => setGroupName(groupId, name),
  })
}
