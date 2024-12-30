import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { GetGroupInfoArguments, GroupInfo, TranslatableError } from 'shared'

export function useGroupInfo(id: number) {
  return useQuery({
    queryKey: ['groupInfo', id],
    queryFn: async (): Promise<GroupInfo> => {
      const args: GetGroupInfoArguments = { groupId: id }
      const info = await makeRequest<GetGroupInfoArguments, GroupInfo>('GET', 'getGroupInfo', args)

      if (info === null) {
        throw new TranslatableError('api.notFound.group')
      }

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
