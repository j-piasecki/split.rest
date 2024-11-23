import { auth } from './firebase'
import { AuthListener, User } from '@type/auth'
import { usePathname, useRouter } from 'expo-router'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  User as FirebaseUser,
} from 'firebase/auth'
import { useEffect, useState } from 'react'

auth.useDeviceLanguage()

let authReady = false
const listeners: AuthListener[] = []

function createUser(user: FirebaseUser | null): User | null {
  if (user) {
    const uid = user.uid
    const name = user.displayName || 'Anonymous'
    return { name }
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

onAuthStateChanged(auth, (user) => {
  let result = createUser(user)
  listeners.forEach((listener) => listener(result))

  if (!authReady) {
    authReady = true
  }
})

export function useAuth() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    return addAuthListener(setUser)
  }, [])

  useEffect(() => {
    if (user === null) {
      if (path !== '/') {
        router.navigate('/')
      }
    }
  }, [user])

  return user
}

export function login() {
  const minWidth = 768
  const isMobile = window.innerWidth < minWidth || screen.width < minWidth

  const provider = new GoogleAuthProvider()
  if (isMobile) {
    signInWithRedirect(auth, provider)
  } else {
    signInWithPopup(auth, provider)
  }
}

export function logout() {
  auth.signOut()
}
