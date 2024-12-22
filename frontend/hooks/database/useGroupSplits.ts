import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetGroupSplitsArguments } from 'shared'
import { SplitInfo } from 'shared'

export function useGroupSplits(groupId?: number, onlyIfIncluded = false) {
  const fetchSplits = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, number>) => {
      if (!groupId) {
        return []
      }

      const args: GetGroupSplitsArguments = {
        groupId,
        startAfterTimestamp: pageParam,
        onlyIfIncluded,
      }

      try {
        const result = await makeRequest<GetGroupSplitsArguments, SplitInfo[]>(
          'GET',
          'getGroupSplits',
          args
        )
        return result ?? []
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 403) {
          return []
        } else {
          throw error
        }
      }
    },
    [groupId, onlyIfIncluded]
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
