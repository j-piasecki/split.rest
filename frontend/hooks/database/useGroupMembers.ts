import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetGroupMembersArguments, Member } from 'shared'

type PageParam = { id: string; balance?: string }

export function useGroupMembers(groupId: number | undefined, lowToHigh?: boolean | undefined) {
  const fetchMembers = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, PageParam>) => {
      if (!groupId) {
        return []
      }

      const args: GetGroupMembersArguments = {
        groupId,
        startAfter: pageParam.id,
        startAfterBalance: pageParam.balance,
        lowToHigh,
      }

      try {
        const result = await makeRequest<GetGroupMembersArguments, Member[]>(
          'GET',
          'getGroupMembers',
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
    [groupId, lowToHigh]
  )

  const result = useInfiniteQuery({
    queryKey: ['groupMembers', groupId, lowToHigh],
    queryFn: fetchMembers,
    initialPageParam: { id: '', balance: undefined },
    getNextPageParam: (lastPage): PageParam | undefined => {
      if (lastPage.length === 0) {
        return undefined
      }

      return {
        id: lastPage[lastPage.length - 1].id,
        balance: lastPage[lastPage.length - 1].balance,
      }
    },
  })

  return {
    members: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    isRefetching: result.isRefetching,
  }
}
