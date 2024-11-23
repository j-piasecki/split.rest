export interface User {
  name: string
  email: string
  uid: string
}

export type AuthListener = (user: User | null) => void
