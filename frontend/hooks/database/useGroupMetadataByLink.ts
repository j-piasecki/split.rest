import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupMetadataByLinkArguments, GroupInfo, TranslatableError } from 'shared'

export function useGroupMetadataByLink(uuid: string) {
  return useQuery({
    queryKey: ['groupMetadataByLink', uuid],
    queryFn: async (): Promise<GroupInfo> => {
      const args: GetGroupMetadataByLinkArguments = { uuid }
      const info = await makeRequest<GetGroupMetadataByLinkArguments, GroupInfo>(
        'GET',
        'getGroupMetadataByLink',
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
