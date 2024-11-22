import { auth } from './firebase'
import { AuthListener, User } from '@type/auth'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { useEffect, useState } from 'react'

auth.useDeviceLanguage()

const listeners: AuthListener[] = []

export function addAuthListener(listener: AuthListener) {
  listeners.push(listener)

  return () => {
    const index = listeners.indexOf(listener)
    listeners.splice(index, 1)
  }
}

onAuthStateChanged(auth, (user) => {
  let result = null
  if (user) {
    const uid = user.uid
    const name = user.displayName || 'Anonymous'
    result = { name }
  }

  listeners.forEach((listener) => listener(result))
})

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    return addAuthListener(setUser)
  }, [])

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
