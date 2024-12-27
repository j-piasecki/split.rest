import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
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
  })
}
