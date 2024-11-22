export interface User {
  name: string
}

export type AuthListener = (user: User | null) => void