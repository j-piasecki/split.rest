import { useQuery } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { GetGroupJoinLinkArguments, GroupJoinLink } from 'shared'

export function useGroupJoinLink(groupId: number) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group join link')
  }

  return useQuery({
    queryKey: ['groupJoinLink', groupId],
    queryFn: async (): Promise<GroupJoinLink | null> => {
      const args: GetGroupJoinLinkArguments = { groupId }

      try {
        const info = await makeRequest<GetGroupJoinLinkArguments, GroupJoinLink>(
          'GET',
          'getGroupJoinLink',
          args
        )

        if (info === null) {
          throw new Error('Group join link not found')
        }

        return info
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) {
          return null
        }

        throw error
      }
    },
  })
}
