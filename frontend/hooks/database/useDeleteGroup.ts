import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { deleteGroupQueries } from '@utils/queryClient'

async function deleteGroup(groupId: number) {
  await makeRequest('DELETE', 'deleteGroup', { groupId })

  await deleteGroupQueries(groupId)
}

export function useDeleteGroup() {
  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(groupId),
  })
}
