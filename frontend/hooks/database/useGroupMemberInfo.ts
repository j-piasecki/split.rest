import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { GetGroupMemberInfoArguments, Member, TranslatableError } from 'shared'

export function useGroupMemberInfo(groupId: number | undefined, memberId: string | undefined) {
  return useQuery({
    queryKey: ['group', groupId, 'member', memberId],
    queryFn: async (): Promise<Member> => {
      if (!groupId) {
        throw new TranslatableError('api.notFound.group')
      }

      if (!memberId) {
        throw new TranslatableError('api.notFound.user')
      }

      const args: GetGroupMemberInfoArguments = { groupId: groupId, memberId: memberId }
      const member = await makeRequest<GetGroupMemberInfoArguments, Member>(
        'GET',
        'getGroupMemberInfo',
        args
      )

      if (member === null) {
        throw new TranslatableError('api.group.userNotInGroup')
      }

      return member
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 3
    },
  })
}
