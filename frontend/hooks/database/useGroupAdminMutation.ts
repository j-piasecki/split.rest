import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMembers } from '@utils/queryClient'
import { SetGroupAdminArguments } from 'shared'

async function setGroupAdmin(groupId: number, userId: string, admin: boolean) {
  const args: SetGroupAdminArguments = { groupId, userId, admin }

  await makeRequest('POST', 'setGroupAdmin', args)

  await invalidateGroupMembers(groupId)
}

export function useSetGroupAdminMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (admin: boolean) => setGroupAdmin(groupId, userId, admin),
  })
}
