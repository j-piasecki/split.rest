import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupMetadataByLinkArguments, GroupMetadata } from 'shared'

export function useGroupMetadataByLink(uuid: string) {
  return useQuery({
    queryKey: ['groupMetadataByLink', uuid],
    queryFn: async (): Promise<GroupMetadata> => {
      const args: GetGroupMetadataByLinkArguments = { uuid }
      const info = await makeRequest<GetGroupMetadataByLinkArguments, GroupMetadata>(
        'GET',
        'getGroupMetadataByLink',
        args,
        false
      )

      if (info === null) {
        throw new Error('Group metadata not found')
      }

      return info
    },
  })
}
