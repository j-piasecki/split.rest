import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetUserGroupsArguments, GroupUserInfo } from 'shared'

export function useUserGroups(hidden: boolean) {
  const fetchGroups = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, number>) => {
      const args: GetUserGroupsArguments = { hidden, startAfter: pageParam }
      const result = await makeRequest<GetUserGroupsArguments, GroupUserInfo[]>(
        'GET',
        'getUserGroups',
        args
      )
      return result ?? []
    },
    [hidden]
  )

  const result = useInfiniteQuery({
    queryKey: ['userGroups', hidden],
    queryFn: fetchGroups,
    initialPageParam: 2147483647,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1].id
    },
    retry(failureCount, error) {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 3
    },
  })

  return {
    groups: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    isRefetching: result.isRefetching,
    error: result.error,
  }
}
