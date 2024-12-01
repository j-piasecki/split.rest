import { makeRequest } from './makeRequest'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function getProfilePicture(url: string): Promise<string | null> {
  const cached = await AsyncStorage.getItem(`photo/${url}`)
  if (cached) {
    return cached
  }

  try {
    const result = (await makeRequest('GET', 'getProfilePicture', { photoURL: url })) as Record<
      string,
      string
    >

    await AsyncStorage.setItem(`photo/${url}`, result.photo)

    return result.photo
  } catch {
    return null
  }
}
