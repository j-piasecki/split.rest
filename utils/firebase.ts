import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD1wsW6_XCS3xymhiG0euK60xiDxNZHIoY',
  authDomain: 'split-6ed94.firebaseapp.com',
  projectId: 'split-6ed94',
  storageBucket: 'split-6ed94.firebasestorage.app',
  messagingSenderId: '461804772528',
  appId: '1:461804772528:web:7f1f4f45d22ae6fec1af75',
  measurementId: 'G-KYEGQF5KND',
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcRp4cqAAAAADoaZ_lxCnRyYZlEtKiqU1y18icK'),
  isTokenAutoRefreshEnabled: true,
})

export { app, analytics, auth, appCheck, db }
