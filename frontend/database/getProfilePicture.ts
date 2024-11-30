import { makeRequest } from './makeRequest'

const cache = new Map<string, string>()

export async function getProfilePicture(url: string): Promise<string | null> {
  if (cache.has(url)) {
    return cache.get(url)!
  }

  try {
    const result = (await makeRequest('GET', 'getProfilePicture', { photoURL: url })) as Record<
      string,
      string
    >

    cache.set(url, result.photo)

    return result.photo
  } catch {
    return null
  }
}
