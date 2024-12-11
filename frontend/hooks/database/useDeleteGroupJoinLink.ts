import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { DeleteGroupJoinLinkArguments, TranslatableError } from 'shared'

export function useDeleteGroupJoinLink() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: number): Promise<void> => {
      const args: DeleteGroupJoinLinkArguments = { groupId }

      await makeRequest<DeleteGroupJoinLinkArguments, void>('DELETE', 'deleteGroupJoinLink', args)

      queryClient.invalidateQueries({ queryKey: ['groupJoinLink', groupId] })
    },
  })
}
