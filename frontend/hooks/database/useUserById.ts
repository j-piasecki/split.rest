import { getUserById } from '@database/getUserById'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@utils/makeApiRequest'
import { useEffect, useState } from 'react'
import { User } from 'shared'

let serverDown: boolean | undefined = undefined
let lastServerDownErrorTimestamp: number = 0

export function useUserById(id: string | undefined) {
  const [localServerDown, setLocalServerDown] = useState<boolean | undefined>(serverDown)

  const result = useQuery({
    queryKey: ['user', id],
    queryFn: async (): Promise<User | null> => {
      if (!id) {
        return null
      }

      return await getUserById(id)
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.statusCode === -1 || error.statusCode === 404)) {
        return false
      }

      return failureCount < 3
    },
  })

  useEffect(() => {
    if (result.error instanceof ApiError && result.error.statusCode === -1) {
      serverDown = true
      setLocalServerDown(true)
      lastServerDownErrorTimestamp = Date.now()
    } else if (result.data !== undefined) {
      serverDown = false
      setLocalServerDown(false)
    }
  }, [result.error, result.data])

  return {
    user: result.data,
    serverDown: localServerDown && Date.now() - lastServerDownErrorTimestamp < 5000,
  }
}
