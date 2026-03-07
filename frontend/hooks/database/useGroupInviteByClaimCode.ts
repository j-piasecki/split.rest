import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import {
  GetGroupInviteByClaimCodeArguments,
  GroupInviteByClaimCodeResponse,
  TranslatableError,
} from 'shared'

export function useGroupInviteByClaimCode(claimCode: string) {
  return useQuery({
    queryKey: ['groupInviteByClaimCode', claimCode],
    queryFn: async (): Promise<GroupInviteByClaimCodeResponse> => {
      const args: GetGroupInviteByClaimCodeArguments = { claimCode }
      const info = await makeRequest<
        GetGroupInviteByClaimCodeArguments,
        GroupInviteByClaimCodeResponse
      >('GET', 'getGroupInviteByClaimCode', args, false)

      if (info === null) {
        throw new TranslatableError('api.group.invalidClaimCode')
      }

      return info
    },
  })
}
