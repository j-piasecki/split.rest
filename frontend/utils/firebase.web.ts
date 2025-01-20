import { getAnalytics, logEvent } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyD1wsW6_XCS3xymhiG0euK60xiDxNZHIoY',
  authDomain: 'split.rest',
  projectId: 'split-6ed94',
  storageBucket: 'split-6ed94.firebasestorage.app',
  messagingSenderId: '461804772528',
  appId: '1:461804772528:web:7f1f4f45d22ae6fec1af75',
  measurementId: 'G-KYEGQF5KND',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
const analytics = getAnalytics(app)

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcRp4cqAAAAADoaZ_lxCnRyYZlEtKiqU1y18icK'),
  isTokenAutoRefreshEnabled: true,
})

auth.useDeviceLanguage()

export const crashlytics = {
  // no-op on web, crashlytics is not supported
  recordError: (_error: Error) => {},
}

export function logScreenView(screenName: string, screenClass: string) {
  logEvent(analytics, 'screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenClass,
  })
}
