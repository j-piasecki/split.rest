import { auth, authObj } from './firebase'
import { queryClient } from './queryClient'
import { sleep } from './sleep'
import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication'
import { FirebaseAuthTypes, firebase } from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import uuid from 'react-native-uuid'
import { TranslatableError, User } from 'shared'

GoogleSignin.configure({
  webClientId: '461804772528-ci5dbjajrcrlv2lsgdap364ki2r2nnkb.apps.googleusercontent.com',
})

let authReady = false

function createUser(user: FirebaseAuthTypes.User | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || user.email?.split('@')[0] || 'Anonymous'
    const photoUrl = user.photoURL || ''
    return { name, email: user.email!, id: uid, photoUrl }
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

export function useAuth(redirectToIndex = true) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(
    authReady ? createUser(auth.currentUser) : undefined
  )

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      authReady = true
      setUser(createUser(user))
    })
    return subscriber
  }, [])

  useEffect(() => {
    if (redirectToIndex && user === null) {
      if (path !== '/') {
        setTimeout(() => {
          router.replace('/')
        }, 0)
      }
    }
  }, [path, router, user, redirectToIndex])

  return user
}

export async function signInWithGoogle() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  console.log('Google Play Services are available')
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn()
  console.log(signInResult)
  // Try the new style of google-sign in result, from v13+ of that module
  const idToken = signInResult.data?.idToken
  if (!idToken) {
    throw new TranslatableError('api.auth.missingToken')
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

export async function signInWithApple() {
  if (Platform.OS === 'ios') {
    // 1). start a apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    })

    // 2). if the request was successful, extract the token and nonce
    const { identityToken, nonce } = appleAuthRequestResponse

    // can be null in some scenarios
    if (identityToken) {
      // 3). create a Firebase `AppleAuthProvider` credential
      const appleCredential = firebase.auth.AppleAuthProvider.credential(identityToken, nonce)

      // 4). use the created `AppleAuthProvider` credential to start a Firebase auth request,
      //     in this example `signInWithCredential` is used, but you could also call `linkWithCredential`
      //     to link the account to an existing user
      const userCredential = await firebase.auth().signInWithCredential(appleCredential)

      // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
      console.warn(`Firebase authenticated via Apple, UID: ${userCredential.user.uid}`)
    } else {
      // handle this - retry?
    }
  } else {
    // Generate secure, random values for state and nonce

    const rawNonce = uuid.v4()
    const state = uuid.v4()

    console.log('rawNonce and state generated')
    // Configure the request
    appleAuthAndroid.configure({
      // The Service ID you registered with Apple
      clientId: 'rest.split',

      // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
      // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
      redirectUri: 'https://split-6ed94.firebaseapp.com/__/auth/handler',

      // The type of response requested - code, id_token, or both.
      responseType: appleAuthAndroid.ResponseType.ALL,

      // The amount of user information requested from Apple.
      scope: appleAuthAndroid.Scope.ALL,

      // Random nonce value that will be SHA256 hashed before sending to Apple.
      nonce: rawNonce,

      // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
      state,
    })

    // Open the browser window for user sign in
    const response = await appleAuthAndroid.signIn()

    if (response.id_token) {
      const appleCredential = firebase.auth.AppleAuthProvider.credential(
        response.id_token,
        rawNonce
      )

      // 4). use the created `AppleAuthProvider` credential to start a Firebase auth request,
      //     in this example `signInWithCredential` is used, but you could also call `linkWithCredential`
      //     to link the account to an existing user
      const userCredential = await firebase.auth().signInWithCredential(appleCredential)

      // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
      console.warn(`Firebase authenticated via Apple, UID: ${userCredential.user.uid}`)
    } else {
      // handle this - retry?
    }
  }
}

export function logout() {
  auth.signOut()
  queryClient.clear()
}
