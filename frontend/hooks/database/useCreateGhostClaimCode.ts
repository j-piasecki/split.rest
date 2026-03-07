import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMember } from '@utils/queryClient'
import { CreateGhostClaimCodeArguments, TranslatableError } from 'shared'

export function useCreateGhostClaimCode() {
  return useMutation({
    mutationFn: async (args: CreateGhostClaimCodeArguments): Promise<string> => {
      const claimCode = await makeRequest<CreateGhostClaimCodeArguments, string>(
        'POST',
        'createGhostClaimCode',
        args
      )

      if (claimCode === null) {
        throw new TranslatableError('api.group.failedToCreateGhostClaimCode')
      }

      await invalidateGroupMember(args.groupId, args.memberId)

      return claimCode
    },
  })
}
