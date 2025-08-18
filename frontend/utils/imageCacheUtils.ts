import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'

// TODO: handle cache invalidation for pictures in a better way
export async function tryInvalidateImageCache() {
  const lastCacheInvalidation = await AsyncStorage.getItem('lastCacheInvalidation')
  if (lastCacheInvalidation && Date.now() - parseInt(lastCacheInvalidation) < 1000 * 60 * 5) {
    return
  }

  await Image.clearDiskCache()
  await AsyncStorage.setItem('lastCacheInvalidation', Date.now().toString())
}
