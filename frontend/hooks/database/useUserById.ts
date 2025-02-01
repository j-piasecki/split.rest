import { getUserById } from '@database/getUserById'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@utils/makeApiRequest'
import { User } from 'shared'

export function useUserById(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async (): Promise<User | null> => {
      if (!id) {
        return null
      }

      return await getUserById(id)
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        return false
      }

      return failureCount < 3
    },
  })
}
