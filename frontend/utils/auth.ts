import { auth, authObj } from './firebase'
import { queryClient } from './queryClient'
import { sleep } from './sleep'
import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { deleteUser as remoteDeleteUser } from '@database/deleteUser'
import { unregisterNotificationToken } from '@database/unregisterNotificationToken'
import { useUserById } from '@hooks/database/useUserById'
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication'
import { FirebaseAuthTypes, firebase } from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { router, usePathname, useRouter } from 'expo-router'
import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
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
    return { name, email: user.email!, id: uid, photoUrl, deleted: false }
  }

  return null
}

async function tryToCreateUser(createUserRetries = 5) {
  try {
    await createOrUpdateUser()
  } catch {
    if (createUserRetries > 0) {
      await sleep(100)
      await tryToCreateUser(createUserRetries - 1)
    } else {
      alert(t('api.auth.createUserFailed'))
    }
  }
}

async function unregisterNotifications() {
  const token = await messaging().getToken()
  await unregisterNotificationToken(token)
  await messaging().deleteToken()
  await messaging().unregisterDeviceForRemoteMessages()
}

export function useAuth(redirectToIndex = true) {
  const path = usePathname()
  const router = useRouter()
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    authReady ? createUser(auth.currentUser) : undefined
  )
  const { data: remoteUser } = useUserById(firebaseUser?.id)
  const user = useMemo<User | null | undefined>(() => {
    return remoteUser ?? firebaseUser
  }, [remoteUser, firebaseUser])

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      authReady = true
      setFirebaseUser(createUser(user))
    })
    return subscriber
  }, [])

  useEffect(() => {
    if (redirectToIndex && firebaseUser === null) {
      if (path !== '/') {
        setTimeout(() => {
          router.replace('/')
        }, 0)
      }
    }
  }, [path, router, firebaseUser, redirectToIndex])

  return user
}

export async function reauthenticate(skipAppleSignIn = false) {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  const providerIds = auth.currentUser.providerData.map((provider) => provider.providerId)

  if (providerIds.includes('apple.com')) {
    if (!skipAppleSignIn) {
      const appleCredential = await getAppleCredential()
      await auth.currentUser?.reauthenticateWithCredential(appleCredential)
    }
  } else if (providerIds.includes('google.com')) {
    const googleCredential = await getGoogleCredential()
    await auth.currentUser?.reauthenticateWithCredential(googleCredential)
  } else {
    throw new TranslatableError('api.auth.unknownProvider')
  }
}

export async function deleteUser() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  await unregisterNotifications()
  await remoteDeleteUser()

  if (Platform.OS === 'ios') {
    const providerIds = auth.currentUser.providerData.map((provider) => provider.providerId)

    if (providerIds.includes('apple.com')) {
      const { authorizationCode } = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.REFRESH,
      })

      // Ensure Apple returned an authorizationCode
      if (!authorizationCode) {
        throw new Error('Apple Revocation failed - no authorizationCode returned')
      }

      // Revoke the token
      await auth.revokeToken(authorizationCode)
    }
  }

  await auth.currentUser?.delete()

  queryClient.clear()
  router.dismissAll()
}

export async function signInWithGoogle() {
  const googleCredential = await getGoogleCredential()

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
  const appleCredential = await getAppleCredential()
  const userCredential = await firebase.auth().signInWithCredential(appleCredential)

  await tryToCreateUser()

  // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
  console.warn(`Firebase authenticated via Apple, UID: ${userCredential.user.uid}`)
}

export async function logout() {
  await unregisterNotifications()
  auth.signOut()
  queryClient.clear()
}

async function getGoogleCredential() {
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

  return googleCredential
}

async function getAppleCredential() {
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

      return appleCredential
    } else {
      throw new TranslatableError('api.auth.missingToken')
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

      return appleCredential
    } else {
      throw new TranslatableError('api.auth.missingToken')
    }
  }
}
