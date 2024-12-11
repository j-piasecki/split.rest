import { auth } from '@utils/firebase'
import { ApiErrorPayload, isApiErrorPayload, LanguageApiErrorKey } from 'shared'

export const ENDPOINT = __DEV__ ? 'http://localhost:3000' : 'https://api.split.rest'

export class ApiError extends Error implements ApiErrorPayload {
  constructor(
    public readonly message: LanguageApiErrorKey,
    public readonly statusCode: number,
    public readonly error: string,
    public readonly args?: Record<string, string>
  ) {
    super(message)
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

      if (isApiErrorPayload(data)) {
        if (__DEV__) {
          console.log('Request to', name, 'failed with', data)
        }

        throw new ApiError(data.message, data.statusCode, data.error, data.args)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError('unknownError', result.status, 'Unknown error')
    }
  }
}
