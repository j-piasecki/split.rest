import { getAnalytics } from '@react-native-firebase/analytics'
import { getAuth } from '@react-native-firebase/auth'
import { getCrashlytics } from '@react-native-firebase/crashlytics'

export const authObj = getAuth()
export const auth = getAuth()
export const crashlytics = getCrashlytics()
const analytics = getAnalytics()

export function logScreenView(screenName: string, screenClass: string) {
  analytics.logScreenView({
    screen_name: screenName,
    screen_class: screenClass,
  })
}
