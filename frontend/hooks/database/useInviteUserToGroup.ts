import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import {
  invalidateDirectGroupInvites,
  invalidateGroupInfo,
  invalidateGroupMembers,
} from '@utils/queryClient'
import { InviteUserToGroupArguments } from 'shared'

export function useInviteUserToGroupMutation(groupId: number) {
  return useMutation({
    mutationFn: async (userId: string) => {
      const args: InviteUserToGroupArguments = { groupId, userId }

      await makeRequest('POST', 'inviteUserToGroup', args)

      invalidateGroupInfo(groupId)
      invalidateGroupMembers(groupId)
      invalidateDirectGroupInvites(groupId)
    },
  })
}
