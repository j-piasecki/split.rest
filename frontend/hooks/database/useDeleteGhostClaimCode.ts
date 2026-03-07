import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMember } from '@utils/queryClient'
import { DeleteGhostClaimCodeArguments } from 'shared'

export function useDeleteGhostClaimCode() {
  return useMutation({
    mutationFn: async (args: DeleteGhostClaimCodeArguments): Promise<void> => {
      await makeRequest<DeleteGhostClaimCodeArguments, void>('DELETE', 'deleteGhostClaimCode', args)

      await invalidateGroupMember(args.groupId, args.memberId)
    },
  })
}
