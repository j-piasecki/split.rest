import { translation } from 'shared'

type LeafPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}.${LeafPaths<T[K]>}` : `${K}`
    }[keyof T & string]
  : never

export type LanguageTranslationKey = LeafPaths<typeof translation>

export interface TranslatableErrorPayload {
  message: LanguageTranslationKey
  args?: Record<string, string>
}

export interface ApiErrorPayload extends TranslatableErrorPayload {
  statusCode: number
  error: string
}

export function isApiErrorPayload(obj: any): obj is ApiErrorPayload {
  return obj.statusCode !== undefined && obj.message !== undefined && obj.error !== undefined
}

export function isTranslatableError(obj: any): obj is TranslatableErrorPayload {
  return obj.message !== undefined
}

export class TranslatableError extends Error implements TranslatableErrorPayload {
  constructor(
    public readonly message: LanguageTranslationKey,
    public readonly args?: Record<string, string>
  ) {
    super(message)
  }
}
