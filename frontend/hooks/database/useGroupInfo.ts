import { useQuery } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupInfoArguments, GroupInfo, TranslatableError } from 'shared'

export function useGroupInfo(id: number) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group info')
  }

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
