import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import {
  GetSplitParticipantsSuggestionsArguments,
  TranslatableError,
  UserWithDisplayName,
} from 'shared'

export function useSplitParticipantsSuggestions(groupId: number) {
  return useQuery({
    queryKey: ['splitParticipantsSuggestions', groupId],
    queryFn: async (): Promise<UserWithDisplayName[]> => {
      const args: GetSplitParticipantsSuggestionsArguments = { groupId }
      const info = await makeRequest<
        GetSplitParticipantsSuggestionsArguments,
        UserWithDisplayName[]
      >('GET', 'getSplitParticipantsSuggestions', args)

      if (info === null) {
        throw new TranslatableError('api.notFound.group')
      }

      return info
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 3
    },
  })
}
