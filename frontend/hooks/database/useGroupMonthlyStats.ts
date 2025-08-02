import { useQuery } from '@tanstack/react-query'
import { ApiError, makeRequest } from '@utils/makeApiRequest'
import { GetGroupMonthlyStatsArguments, GroupMonthlyStats, TranslatableError } from 'shared'

export function useGroupMonthlyStats(id: number) {
  return useQuery({
    queryKey: ['groupMonthlyStats', id],
    queryFn: async (): Promise<GroupMonthlyStats> => {
      const args: GetGroupMonthlyStatsArguments = { groupId: id }
      const stats = await makeRequest<GetGroupMonthlyStatsArguments, GroupMonthlyStats>(
        'GET',
        'getGroupMonthlyStats',
        args
      )

      if (stats === null) {
        throw new TranslatableError('api.notFound.group')
      }

      return stats
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)) {
        return false
      }

      return failureCount < 3
    },
  })
}
