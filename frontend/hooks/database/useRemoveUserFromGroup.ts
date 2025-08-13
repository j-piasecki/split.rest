import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupInfo, invalidateGroupMembers } from '@utils/queryClient'
import { RemoveMemberFromGroupArguments } from 'shared'

export function useRemoveUserFromGroupMutation(groupId: number) {
  return useMutation({
    mutationFn: async (userId: string) => {
      const args: RemoveMemberFromGroupArguments = { groupId, userId }

      await makeRequest('POST', 'removeMember', args)

      await invalidateGroupInfo(groupId)
      await invalidateGroupMembers(groupId)
    },
  })
}
