import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { updateCachedGroupMember } from '@utils/queryClient'
import { SetGroupAdminArguments } from 'shared'

async function setGroupAdmin(groupId: number, userId: string, admin: boolean) {
  const args: SetGroupAdminArguments = { groupId, userId, admin }

  await makeRequest('POST', 'setGroupAdmin', args)

  await updateCachedGroupMember(groupId, userId, (member) => ({ ...member, isAdmin: admin }))
}

export function useSetGroupAdminMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (admin: boolean) => setGroupAdmin(groupId, userId, admin),
  })
}
