import { apiErrors } from 'shared'

type LeafPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}.${LeafPaths<T[K]>}` : `${K}`
    }[keyof T & string]
  : never

export type LanguageKeys = LeafPaths<typeof apiErrors>
