import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetGroupSplitsArguments } from 'shared'
import { SplitInfo } from 'shared'

export function useGroupSplits(groupId: number) {
  const fetchSplits = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, number>) => {
      const args: GetGroupSplitsArguments = { groupId, startAfterTimestamp: pageParam }
      const result = await makeRequest<GetGroupSplitsArguments, SplitInfo[]>(
        'GET',
        'getGroupSplits',
        args
      )
      return result ?? []
    },
    [groupId]
  )

  const result = useInfiniteQuery({
    queryKey: ['groupSplits', groupId],
    queryFn: fetchSplits,
    initialPageParam: Number.MAX_SAFE_INTEGER,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1].timestamp
    },
  })

  return {
    splits: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  }
}
