import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups } from '@utils/queryClient'
import { ClaimGhostUserArguments } from 'shared'

export function useClaimGhostUser() {
  return useMutation({
    mutationFn: async (claimCode: string) => {
      const args: ClaimGhostUserArguments = { claimCode }
      await makeRequest('POST', 'claimGhostUser', args)

      await invalidateUserGroups(false)
    },
  })
}
