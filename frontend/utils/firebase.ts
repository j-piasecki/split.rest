import firebaseAnalytics from '@react-native-firebase/analytics'
import firebaseAuth from '@react-native-firebase/auth'
import firebaseCrashlytics from '@react-native-firebase/crashlytics'

export const authObj = firebaseAuth
export const auth = firebaseAuth()
export const crashlytics = firebaseCrashlytics()
const analytics = firebaseAnalytics()

export function logScreenView(screenName: string, screenClass: string) {
  analytics.logScreenView({
    screen_name: screenName,
    screen_class: screenClass,
  })
}
