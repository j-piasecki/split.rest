import { auth } from '@utils/firebase'

export const ENDPOINT = __DEV__ ? 'http://localhost:3000' : 'https://api.split.rest'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function makeRequest<TArgs, TReturn>(
  method: 'POST' | 'GET' | 'DELETE',
  name: string,
  args: { [K in keyof TArgs]: TArgs[K] },
  authRequired = true
) {
  if (authRequired && !auth.currentUser) {
    throw new Error('You must be logged in to make a request')
  }

  if (__DEV__) {
    console.log('Making request to', name, 'with', args)
  }

  const url = new URL(`${ENDPOINT}/${name}`)

  if (method === 'GET') {
    const cleanedArgs: Record<string, string> = {}

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null) {
        cleanedArgs[key] = String(value)
      }
    }

    const params = new URLSearchParams(cleanedArgs)
    url.search = params.toString()
  }

  const result = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: method === 'POST' || method === 'DELETE' ? JSON.stringify(args) : undefined,
  })

  if (__DEV__) {
    console.log('Request to', name, 'status:', result.status)
  }

  if (result.ok) {
    try {
      const data = await result.json()

      if (__DEV__) {
        console.log('Request to', name, 'succeeded with', data)
      }

      return data as TReturn
    } catch {
      return null
    }
  } else {
    try {
      const data = await result.json()
      throw new ApiError(data.message, result.status)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError('Failed to finish a request: ' + result.statusText, result.status)
    }
  }
}
