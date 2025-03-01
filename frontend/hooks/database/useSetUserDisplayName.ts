import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserById } from '@utils/queryClient'
import { SetUserDisplayNameArguments } from 'shared'

async function setUserDisplayName(groupId: number, userId: string, name: string) {
  const args: SetUserDisplayNameArguments = { groupId, userId, displayName: name }

  await makeRequest('POST', 'setUserDisplayName', args)
  await invalidateUserById(userId)
}

export function useSetUserDisplayNameMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (name: string) => setUserDisplayName(groupId, userId, name),
  })
}
