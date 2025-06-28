import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { QueryGroupSplitsArguments, SplitQuery } from 'shared'
import { SplitInfo } from 'shared'

export function useGroupSplitsQuery(groupId?: number, query?: SplitQuery) {
  const fetchSplits = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, SplitInfo | undefined>) => {
      if (!groupId) {
        return []
      }

      const args: QueryGroupSplitsArguments = {
        groupId,
        query: query ?? {},
        startAfter: pageParam,
      }

      try {
        const result = await makeRequest<QueryGroupSplitsArguments, SplitInfo[]>(
          'POST',
          'queryGroupSplits',
          args
        )
        return result ?? []
      } catch (error) {
        if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 404)) {
          return []
        } else {
          throw error
        }
      }
    },
    [groupId, query]
  )

  const result = useInfiniteQuery({
    queryKey: ['groupSplits', groupId, 'query', JSON.stringify(query)],
    queryFn: fetchSplits,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1]
    },
    retry(failureCount, error) {
      if (error instanceof ApiError && error.statusCode === 403) {
        return false
      }

      return failureCount < 3
    },
  })

  return {
    splits: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    isRefetching: result.isRefetching,
  }
}
