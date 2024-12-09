import { useQuery } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupMetadataByLinkArguments, GroupMetadata } from 'shared'

export function useGroupMetadataByLink(uuid: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group metadata by link')
  }

  return useQuery({
    queryKey: ['groupMetadataByLink', uuid],
    queryFn: async (): Promise<GroupMetadata> => {
      const args: GetGroupMetadataByLinkArguments = { uuid }
      const info = await makeRequest<GetGroupMetadataByLinkArguments, GroupMetadata>('GET', 'getGroupMetadataByLink', args)

      if (info === null) {
        throw new Error('Group metadata not found')
      }

      return info
    },
  })
}
