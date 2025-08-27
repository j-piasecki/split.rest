import { DisplayClass, getDisplayClass } from './dimensionUtils'
import { auth } from './firebase.web'
import { queryClient } from './queryClient'
import { sleep } from './sleep'
import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { deleteUser as remoteDeleteUser } from '@database/deleteUser'
import { useUserById } from '@hooks/database/useUserById'
import { AuthListener } from '@type/auth'
import { getLocales } from 'expo-localization'
import { router, usePathname, useRouter } from 'expo-router'
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { User } from 'shared'

let authReady = false
const listeners: AuthListener[] = []

function createUser(user: FirebaseUser | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || user.email?.split('@')[0] || 'Anonymous'
    return { name, email: user.email!, id: uid, deleted: false }
  }

  return null
}

function addAuthListener(listener: AuthListener) {
  listeners.push(listener)

  if (authReady) {
    listener(createUser(auth.currentUser))
  }

  return () => {
    const index = listeners.indexOf(listener)
    listeners.splice(index, 1)
  }
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await tryToCreateUser()
  }

  const result = createUser(user)
  listeners.forEach((listener) => listener(result))

  if (!authReady) {
    authReady = true
  }
})

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
    return addAuthListener(setFirebaseUser)
  }, [])

  useEffect(() => {
    if (redirectToIndex && firebaseUser === null) {
      if (path !== '/') {
        setTimeout(() => {
          router.replace('/')
        }, 50)
      }
    }
  }, [path, router, firebaseUser, redirectToIndex])

  return user
}

async function reauthenticateWithPopupOrRedirect(provider: GoogleAuthProvider | OAuthProvider) {
  if (!auth.currentUser) {
    throw new Error('User must be logged in')
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (getDisplayClass() === DisplayClass.Small || isMobile) {
    await reauthenticateWithRedirect(auth.currentUser, provider)
  } else {
    await reauthenticateWithPopup(auth.currentUser, provider)
  }
}

export async function reauthenticate() {
  if (!auth.currentUser) {
    throw new Error('User must be logged in')
  }

  const providerIds = auth.currentUser.providerData.map((provider) => provider.providerId)

  if (providerIds.includes('google.com')) {
    await reauthenticateWithPopupOrRedirect(new GoogleAuthProvider())
  } else if (providerIds.includes('apple.com')) {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')

    provider.setCustomParameters({
      locale: getLocales()[0].languageCode ?? 'en',
    })

    await reauthenticateWithPopupOrRedirect(provider)
  } else {
    throw new Error('Provider not supported')
  }
}

export async function deleteUser() {
  await remoteDeleteUser()
  await auth.currentUser?.delete()

  queryClient.clear()
  router.dismissTo('/login')
}

export function signInWithGoogle() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const provider = new GoogleAuthProvider()
  if (getDisplayClass() === DisplayClass.Small || isMobile) {
    signInWithRedirect(auth, provider)
  } else {
    signInWithPopup(auth, provider)
  }
}

export function signInWithApple() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')

  provider.setCustomParameters({
    locale: getLocales()[0].languageCode ?? 'en',
  })

  if (getDisplayClass() === DisplayClass.Small || isMobile) {
    signInWithRedirect(auth, provider)
  } else {
    signInWithPopup(auth, provider).catch((error) => {
      console.error(error, error.message)
    })
  }
}

export async function logout() {
  auth.signOut()
  queryClient.clear()
}
