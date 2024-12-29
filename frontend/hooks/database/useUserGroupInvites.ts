import { QueryFunctionContext, QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { useCallback } from 'react'
import { GetUserInvitesArguments, GroupInvite } from 'shared'

export function useUserGroupInvites(ignored: boolean) {
  const fetchInvites = useCallback(
    async ({ pageParam }: QueryFunctionContext<QueryKey, number>) => {
      const args: GetUserInvitesArguments = { ignored, startAfter: pageParam }
      const result = await makeRequest<GetUserInvitesArguments, GroupInvite[]>(
        'GET',
        'getUserGroupInvites',
        args
      )
      return result ?? []
    },
    [ignored]
  )

  const result = useInfiniteQuery({
    queryKey: ['groupInvites', ignored],
    queryFn: fetchInvites,
    initialPageParam: Number.MAX_SAFE_INTEGER,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPage[lastPage.length - 1].createdAt
    },
  })

  return {
    invites: result.data?.pages.flatMap((page) => page) ?? [],
    isLoading: result.isLoading,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    isRefetching: result.isRefetching,
  }
}
