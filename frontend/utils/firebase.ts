import firebaseAuth from '@react-native-firebase/auth'
import firebaseCrashlytics from '@react-native-firebase/crashlytics'

export const authObj = firebaseAuth
export const auth = firebaseAuth()
export const crashlytics = firebaseCrashlytics()
