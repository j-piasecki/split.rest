import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'

async function deleteGroup(queryClient: QueryClient, groupId: number) {
  await makeRequest('DELETE', 'deleteGroup', { groupId })

  queryClient.invalidateQueries({ queryKey: ['userGroups'] })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(queryClient, groupId),
  })
}
