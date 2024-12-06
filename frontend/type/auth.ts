import { User } from 'shared'

export type AuthListener = (user: User | null) => void
