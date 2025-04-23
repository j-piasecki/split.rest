import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { SettleUpArguments, SplitWithHashedChanges, TranslatableError } from 'shared'

export function useSettleUpPreview(groupId?: number) {
  return useQuery({
    queryKey: ['settleUpPreview', groupId],
    staleTime: 0,
    queryFn: async (): Promise<SplitWithHashedChanges | null> => {
      if (groupId === undefined) {
        return null
      }

      const args: SettleUpArguments = { groupId: groupId }
      const info = await makeRequest<SettleUpArguments, SplitWithHashedChanges>(
        'GET',
        'getSettleUpPreview',
        args
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.split')
      }

      return info
    },
  })
}
