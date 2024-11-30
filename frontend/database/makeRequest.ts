import { ENDPOINT } from './endpoint'
import { auth } from '@utils/firebase'

export async function makeRequest<TArgs, TReturn>(
  method: 'POST' | 'GET',
  name: string,
  args: { [K in keyof TArgs]: TArgs[K] }
) {
  if (!auth.currentUser) {
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
      'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`,
    },
    body: method === 'POST' ? JSON.stringify(args) : undefined,
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
    throw new Error('Failed to finish a request: ' + result.statusText)
  }
}
