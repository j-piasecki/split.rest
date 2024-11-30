import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { auth } from './firebase'
import { isSmallScreen } from './isSmallScreen'
import { AuthListener, User } from '@type/auth'
import { usePathname, useRouter } from 'expo-router'
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { useEffect, useState } from 'react'

auth.useDeviceLanguage()

let authReady = false
const listeners: AuthListener[] = []

function createUser(user: FirebaseUser | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || 'Anonymous'
    const photoURL = user.photoURL || ''
    return { name, email: user.email!, uid, photoURL }
  }

  return null
}

export function addAuthListener(listener: AuthListener) {
  listeners.push(listener)

  if (authReady) {
    listener(createUser(auth.currentUser))
  }

  return () => {
    const index = listeners.indexOf(listener)
    listeners.splice(index, 1)
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await createOrUpdateUser()
  }

  const result = createUser(user)
  listeners.forEach((listener) => listener(result))

  if (!authReady) {
    authReady = true
  }
})

export function useAuth() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(
    authReady ? createUser(auth.currentUser) : undefined
  )

  useEffect(() => {
    return addAuthListener(setUser)
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
export function login() {
  const provider = new GoogleAuthProvider()
  if (isSmallScreen()) {
    signInWithRedirect(auth, provider)
  } else {
    signInWithPopup(auth, provider)
  }
}

export function logout() {
  auth.signOut()
}
