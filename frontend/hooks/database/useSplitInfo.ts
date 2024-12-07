import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetSplitInfoArguments, SplitWithUsers } from 'shared'

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
        throw new Error('Split info not found')
      }

      return info
    },
  })
}
