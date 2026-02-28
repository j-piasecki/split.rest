import { auth, getIdToken } from '@utils/firebase'
import {
  ApiErrorPayload,
  LanguageTranslationKey,
  TranslatableError,
  isApiErrorPayload,
} from 'shared'

export const ENDPOINT = __DEV__ ? 'http://localhost:3000' : 'https://api.split.rest'

export class ApiError extends Error implements ApiErrorPayload {
  constructor(
    public readonly message: LanguageTranslationKey,
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
    throw new TranslatableError('api.mustBeLoggedIn')
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

  let result: Response
  try {
    result = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.currentUser ? await getIdToken(auth.currentUser) : undefined}`,
      },
      body: method === 'POST' || method === 'DELETE' ? JSON.stringify(args) : undefined,
    })
  } catch {
    throw new ApiError('api.serverIsNotResponding', -1, 'Server is down')
  }

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
      } else {
        throw new ApiError('unknownError', result.status, 'Unknown error')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError('unknownError', result.status, 'Unknown error')
    }
  }
}

export async function makeRequestWithFile<TArgs, TReturn>(
  method: 'POST',
  name: string,
  args: { [K in keyof TArgs]: TArgs[K] } & {
    file: {
      name: string
      type: string
      uri: string
    }
  }
) {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  if (__DEV__) {
    console.log('Making request to', name, 'with', args)
  }

  const url = new URL(`${ENDPOINT}/${name}`)
  const formData = new FormData()

  for (const [key, value] of Object.entries(args)) {
    if (key === 'file') {
      // @ts-expect-error - IDK, seems like the RN types are wrong here
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }

  const result = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${auth.currentUser ? await getIdToken(auth.currentUser) : undefined}`,
    },
    body: formData,
  })

  if (result.ok) {
    const data = await result.json()
    if (__DEV__) {
      console.log('Request to', name, 'succeeded with', data)
    }
    return data as TReturn
  } else {
    try {
      const data = await result.json()

      if (isApiErrorPayload(data)) {
        if (__DEV__) {
          console.log('Request to', name, 'failed with', data)
        }

        throw new ApiError(data.message, data.statusCode, data.error, data.args)
      } else {
        throw new ApiError('unknownError', result.status, 'Unknown error')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError('unknownError', result.status, 'Unknown error')
    }
  }
}
