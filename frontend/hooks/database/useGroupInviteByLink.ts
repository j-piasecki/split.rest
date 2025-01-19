import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupInviteByLinkArguments, GroupInvite, TranslatableError } from 'shared'

export function useGroupInviteByLink(uuid: string) {
  return useQuery({
    queryKey: ['groupInviteByLink', uuid],
    queryFn: async (): Promise<GroupInvite> => {
      const args: GetGroupInviteByLinkArguments = { uuid }
      const info = await makeRequest<GetGroupInviteByLinkArguments, GroupInvite>(
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
