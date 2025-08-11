import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { SettleUpArguments, SplitWithHashedChanges, TranslatableError } from 'shared'

export function useSettleUpPreview(groupId?: number, withMembers?: string[], amounts?: string[]) {
  return useQuery({
    queryKey: ['settleUpPreview', groupId, Math.random()],
    queryFn: async (): Promise<SplitWithHashedChanges | null> => {
      if (groupId === undefined) {
        return null
      }

      const args: SettleUpArguments = {
        groupId: groupId,
        withMembers: withMembers,
        amounts: amounts,
      }
      const info = await makeRequest<SettleUpArguments, SplitWithHashedChanges>(
        'GET',
        'getSettleUpPreview',
        args
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.split')
      }

      info.users.forEach((user) => {
        user.pending = false
      })

      return info
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 400 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 3
    },
  })
}
