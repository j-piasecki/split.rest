export interface User {
  name: string
  email: string
  uid: string
  photoURL: string
}

export type AuthListener = (user: User | null) => void
