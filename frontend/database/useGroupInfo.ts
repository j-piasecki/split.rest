import { makeRequest } from '../utils/makeApiRequest'
import { useQuery } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { GetGroupInfoArguments, GroupInfo } from 'shared'

export function useGroupInfo(id: number) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group info')
  }

  return useQuery({
    queryKey: ['groupInfo', id],
    queryFn: async () => {
      const args: GetGroupInfoArguments = { groupId: id }
      const info = await makeRequest<GetGroupInfoArguments,GroupInfo>('GET', 'getGroupInfo', args)

      if (info === null) {
        throw new Error('Group info not found')
      }

      return info
    },
  })
}
