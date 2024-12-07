import { useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { AddUserToGroupArguments } from 'shared'

export function useAddUserToGroupMutation(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const args: AddUserToGroupArguments = { groupId, userId }

      await makeRequest('POST', 'addUserToGroup', args)

      queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    },
  })
}
