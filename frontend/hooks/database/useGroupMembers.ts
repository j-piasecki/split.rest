import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetGroupMembersArguments, Member } from 'shared'

export function useGroupMembers(groupId: number | undefined) {
  const fetchMembers = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, string>) => {
      if (!groupId) {
        return []
      }

      const args: GetGroupMembersArguments = { groupId, startAfter: pageParam }

      try {
        const result = await makeRequest<GetGroupMembersArguments, Member[]>(
          'GET',
          'getGroupMembers',
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
    [groupId]
  )

  const result = useInfiniteQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: fetchMembers,
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1].id
    },
  })

  return {
    members: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  }
}
