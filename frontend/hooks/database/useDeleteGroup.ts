import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'

async function deleteGroup(groupId: number) {
  await makeRequest('DELETE', 'deleteGroup', { groupId })

  await invalidateGroup(groupId)
}

export function useDeleteGroup() {
  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(groupId),
  })
}
