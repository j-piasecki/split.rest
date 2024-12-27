import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupJoinLink } from '@utils/queryClient'
import { DeleteGroupJoinLinkArguments } from 'shared'

export function useDeleteGroupJoinLink() {
  return useMutation({
    mutationFn: async (groupId: number): Promise<void> => {
      const args: DeleteGroupJoinLinkArguments = { groupId }

      await makeRequest<DeleteGroupJoinLinkArguments, void>('DELETE', 'deleteGroupJoinLink', args)

      await invalidateGroupJoinLink(groupId)
    },
  })
}
