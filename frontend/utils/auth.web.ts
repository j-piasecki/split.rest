import { isSmallScreen } from './dimensionUtils'
import { auth } from './firebase.web'
import { sleep } from './sleep'
import { createOrUpdateUser } from '@database/createOrUpdateUser'
import { AuthListener } from '@type/auth'
import { usePathname, useRouter } from 'expo-router'
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { User } from 'shared'

let authReady = false
const listeners: AuthListener[] = []

function createUser(user: FirebaseUser | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || 'Anonymous'
    const photoUrl = user.photoURL || ''
    return { name, email: user.email!, id: uid, photoUrl }
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
