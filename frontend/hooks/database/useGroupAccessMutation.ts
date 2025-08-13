import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMembers } from '@utils/queryClient'
import { SetGroupAccessArguments } from 'shared'

async function setGroupAccess(groupId: number, userId: string, access: boolean) {
  const args: SetGroupAccessArguments = { groupId, userId, access }

  await makeRequest('POST', 'setGroupAccess', args)

  await invalidateGroupMembers(groupId)
}

export function useSetGroupAccessMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (access: boolean) => setGroupAccess(groupId, userId, access),
  })
}
