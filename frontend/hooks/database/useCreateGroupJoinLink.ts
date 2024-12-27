import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupJoinLink } from '@utils/queryClient'
import { CreateGroupJoinLinkArguments } from 'shared'

export function useCreateGroupJoinLink() {
  return useMutation({
    mutationFn: async (groupId: number): Promise<void> => {
      const args: CreateGroupJoinLinkArguments = { groupId }

      await makeRequest<CreateGroupJoinLinkArguments, void>('POST', 'createGroupJoinLink', args)

      await invalidateGroupJoinLink(groupId)
    },
  })
}
