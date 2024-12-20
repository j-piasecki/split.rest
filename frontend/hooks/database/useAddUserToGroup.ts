import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupInfo, invalidateGroupMembers } from '@utils/queryClient'
import { AddUserToGroupArguments } from 'shared'

export function useAddUserToGroupMutation(groupId: number) {
  return useMutation({
    mutationFn: async (userId: string) => {
      const args: AddUserToGroupArguments = { groupId, userId }

      await makeRequest('POST', 'addUserToGroup', args)

      invalidateGroupInfo(groupId)
      invalidateGroupMembers(groupId)
    },
  })
}
