import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetSplitInfoArguments, SplitWithUsers, TranslatableError } from 'shared'

export function useSplitInfo(groupId: number, splitId: number) {
  return useQuery({
    queryKey: ['groupSplits', groupId, splitId],
    queryFn: async (): Promise<SplitWithUsers> => {
      const args: GetSplitInfoArguments = { groupId: groupId, splitId: splitId }
      const info = await makeRequest<GetSplitInfoArguments, SplitWithUsers>(
        'GET',
        'getSplitInfo',
        args
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.split')
      }

      return info
    },
  })
}
