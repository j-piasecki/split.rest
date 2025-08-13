import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import {
  GetGroupInfoArguments,
  GroupMemberPermissions,
  GroupUserInfo,
  TranslatableError,
} from 'shared'

export function useGroupInfo(id: number) {
  return useQuery({
    queryKey: ['groupInfo', id],
    queryFn: async (): Promise<GroupUserInfo> => {
      const args: GetGroupInfoArguments = { groupId: id }
      const info = await makeRequest<GetGroupInfoArguments, GroupUserInfo>(
        'GET',
        'getGroupInfo',
        args
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.group')
      }

      info.permissions = new GroupMemberPermissions(
        info.permissions.splits,
        info.permissions.members,
        info.permissions.manage
      )

      return info
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        return false
      }

      return failureCount < 3
    },
  })
}
