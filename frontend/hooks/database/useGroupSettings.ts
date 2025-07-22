import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { GetGroupSettingsArguments, GroupSettings, TranslatableError } from 'shared'

export function useGroupSettings(groupId: number) {
  return useQuery({
    queryKey: ['groupSettings', groupId],
    queryFn: async (): Promise<GroupSettings> => {
      const args: GetGroupSettingsArguments = { groupId }
      const settings = await makeRequest<GetGroupSettingsArguments, GroupSettings>(
        'GET',
        'getGroupSettings',
        args
      )

      if (settings === null) {
        throw new TranslatableError('api.notFound.group')
      }

      return settings
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        return false
      }

      return failureCount < 3
    },
  })
}
