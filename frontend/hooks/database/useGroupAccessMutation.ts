import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { updateCachedGroupMember } from '@utils/queryClient'
import { SetGroupAccessArguments } from 'shared'

async function setGroupAccess(groupId: number, userId: string, access: boolean) {
  const args: SetGroupAccessArguments = { groupId, userId, access }

  await makeRequest('POST', 'setGroupAccess', args)

  await updateCachedGroupMember(groupId, userId, (member) => ({
    ...member,
    hasAccess: access,
    isAdmin: access ? member.isAdmin : false,
  }))
}

export function useSetGroupAccessMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (access: boolean) => setGroupAccess(groupId, userId, access),
  })
}
