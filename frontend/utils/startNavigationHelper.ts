import AsyncStorage from '@react-native-async-storage/async-storage'

const LAST_GROUP_KEY = 'lastOpenedGroupId'

export async function getLastOpenedGroupId(): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(LAST_GROUP_KEY)
    if (value === null) {
      return null
    }
    const id = parseInt(value, 10)
    return isNaN(id) ? null : id
  } catch {
    return null
  }
}

export async function setLastOpenedGroupId(id: number | null): Promise<void> {
  try {
    if (id === null) {
      await AsyncStorage.removeItem(LAST_GROUP_KEY)
    } else {
      await AsyncStorage.setItem(LAST_GROUP_KEY, String(id))
    }
  } catch {
    // silently ignore storage errors
  }
}

let joinRedirect: string | null = null

export function setJoinRedirect(join: string | null) {
  joinRedirect = join
}

export function getJoinRedirect() {
  return joinRedirect
}

export function clearJoinRedirect() {
  joinRedirect = null
}
