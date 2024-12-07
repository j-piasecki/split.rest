import { makeRequest } from './makeRequest'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function getProfilePicture(userId: string): Promise<string | null> {
  const cached = await AsyncStorage.getItem(`profilePicture/${userId}`)
  if (cached) {
    return cached
  }

  try {
    const result = (await makeRequest('GET', 'getProfilePicture', { userId })) as Record<
      string,
      string
    >

    await AsyncStorage.setItem(`profilePicture/${userId}`, result.photo)

    return result.photo
  } catch {
    return null
  }
}
