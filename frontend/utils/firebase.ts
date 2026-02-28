import { getAnalytics, logEvent } from '@react-native-firebase/analytics'
import { getAuth, getIdToken as rnGetIdToken } from '@react-native-firebase/auth'
import { getCrashlytics } from '@react-native-firebase/crashlytics'

export const authObj = getAuth()
export const auth = getAuth()
export const crashlytics = getCrashlytics()
const analytics = getAnalytics()

export function logScreenView(screenName: string, screenClass: string) {
  logEvent(analytics, 'screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenClass,
  })
}

export const getIdToken = rnGetIdToken
