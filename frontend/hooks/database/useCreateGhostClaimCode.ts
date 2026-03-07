import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMember } from '@utils/queryClient'
import { CreateGhostClaimCodeArguments, GhostClaimCode, TranslatableError } from 'shared'

export function useCreateGhostClaimCode() {
  return useMutation({
    mutationFn: async (args: CreateGhostClaimCodeArguments): Promise<string> => {
      const result = await makeRequest<CreateGhostClaimCodeArguments, GhostClaimCode>(
        'POST',
        'createGhostClaimCode',
        args
      )

      if (result === null || result.claimCode === null) {
        throw new TranslatableError('api.group.failedToCreateGhostClaimCode')
      }

      await invalidateGroupMember(args.groupId, args.memberId)

      return result.claimCode
    },
  })
}
