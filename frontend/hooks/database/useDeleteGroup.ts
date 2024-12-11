import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'

async function deleteGroup(queryClient: QueryClient, groupId: number) {
  await makeRequest('DELETE', 'deleteGroup', { groupId })

  queryClient.removeQueries({ queryKey: ['groupSplits', groupId] })
  queryClient.removeQueries({ queryKey: ['groupMembers', groupId] })
  queryClient.removeQueries({ queryKey: ['groupInfo', groupId] })

  await queryClient.invalidateQueries({ queryKey: ['userGroups'] })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(queryClient, groupId),
  })
}
