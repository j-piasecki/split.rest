import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupInvites, invalidateUserGroups } from '@utils/queryClient'
import { AcceptGroupInviteArguments } from 'shared'

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (groupId: number) => {
      const args: AcceptGroupInviteArguments = { groupId }
      await makeRequest('POST', 'acceptGroupInvite', args)

      await invalidateUserGroups(false)
      await invalidateGroupInvites()
    },
  })
}
