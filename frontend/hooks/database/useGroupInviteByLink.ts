import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupInviteByLinkArguments, GroupInviteWithGroupInfo, TranslatableError } from 'shared'

export function useGroupInviteByLink(uuid: string) {
  return useQuery({
    queryKey: ['groupInviteByLink', uuid],
    queryFn: async (): Promise<GroupInviteWithGroupInfo> => {
      const args: GetGroupInviteByLinkArguments = { uuid }
      const info = await makeRequest<GetGroupInviteByLinkArguments, GroupInviteWithGroupInfo>(
        'GET',
        'getGroupInviteByLink',
        args,
        false
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.group')
      }

      return info
    },
  })
}
