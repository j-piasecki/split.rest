import { useMutation } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupJoinLink } from '@utils/queryClient'
import { CreateGroupJoinLinkArguments, TranslatableError } from 'shared'

export function useCreateGroupJoinLink() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  return useMutation({
    mutationFn: async (groupId: number): Promise<void> => {
      const args: CreateGroupJoinLinkArguments = { groupId }

      await makeRequest<CreateGroupJoinLinkArguments, void>('POST', 'createGroupJoinLink', args)

      await invalidateGroupJoinLink(groupId)
    },
  })
}
