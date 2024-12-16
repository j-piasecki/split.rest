import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetSplitHistoryArguments, SplitWithUsers } from 'shared'

export function useSplitHistory(groupId?: number, splitId?: number) {
  const fetchSplits = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, number>) => {
      if (!groupId || !splitId) {
        return []
      }

      const args: GetSplitHistoryArguments = { groupId, splitId, startAfter: pageParam }
      const result = await makeRequest<GetSplitHistoryArguments, SplitWithUsers[]>(
        'GET',
        'getSplitHistory',
        args
      )
      return result ?? []
    },
    [groupId, splitId]
  )

  const result = useInfiniteQuery({
    queryKey: ['splitHistory', groupId, splitId],
    queryFn: fetchSplits,
    initialPageParam: 2147483647,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1].version
    },
  })

  return {
    history: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  }
}
