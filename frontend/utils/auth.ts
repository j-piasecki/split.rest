import { auth, authObj } from './firebase'
import { sleep } from './sleep'
import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { User } from '@type/auth'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

GoogleSignin.configure({
  webClientId: '461804772528-nlsf24kbqq46eatjr9hl8au9fj75j8nt.apps.googleusercontent.com',
})

let authReady = false

function createUser(user: FirebaseAuthTypes.User | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || 'Anonymous'
    const photoURL = user.photoURL || ''
    return { name, email: user.email!, uid, photoURL }
  }

  return null
}

let createUserRetries = 5
async function tryToCreateUser() {
  try {
    await createOrUpdateUser()
  } catch {
    if (createUserRetries > 0) {
      createUserRetries--
      await sleep(100)
      await tryToCreateUser()
    }
  }
}

export function useAuth() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(
    authReady ? createUser(auth.currentUser) : undefined
  )

  useEffect(() => {
    console.log('useAuth effect')
    const subscriber = auth.onAuthStateChanged((user) => {
      console.log(JSON.stringify(createUser(user)))
      authReady = true
      setUser(createUser(user))
    })
    return subscriber
  }, [])

  useEffect(() => {
    if (user === null) {
      if (path !== '/') {
        router.navigate('/')
      }
    }
  }, [path, router, user])

  return user
}

export async function login() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  console.log('Google Play Services are available')
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn()
  console.log(signInResult)
  // Try the new style of google-sign in result, from v13+ of that module
  const idToken = signInResult.data?.idToken
  if (!idToken) {
    throw new Error('No ID token found')
  }

  // Create a Google credential with the token
  const googleCredential = authObj.GoogleAuthProvider.credential(idToken)

  // Sign-in the user with the credential
  return auth
    .signInWithCredential(googleCredential)
    .then((user) => {
      console.log('User signed in', user.user?.email)
      tryToCreateUser()
    })
    .catch((error) => {
      console.error('Error signing in', error)
    })
}

export function logout() {
  auth.signOut()
}
