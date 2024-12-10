import { apiErrors } from 'shared'

type LeafPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}.${LeafPaths<T[K]>}` : `${K}`
    }[keyof T & string]
  : never

export type LanguageApiErrorKey = LeafPaths<typeof apiErrors>

export interface ApiErrorPayload {
  statusCode: number
  message: LanguageApiErrorKey
  error: string
  args?: Record<string, string>
}

export function isApiErrorPayload(obj: any): obj is ApiErrorPayload {
  return obj.statusCode !== undefined && obj.message !== undefined && obj.error !== undefined
}
