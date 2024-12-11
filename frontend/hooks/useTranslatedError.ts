import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isTranslatableError } from 'shared'

export function useTranslatedError(): [string | null, (error: unknown) => void] {
  const [error, setError] = useState<unknown>(null)
  const { t } = useTranslation(['translation'])

  let message: string | null = null

  if (error) {
    if (error instanceof Error) {
      if (isTranslatableError(error)) {
        message = t(error.message, error.args)
      } else {
        message = error.message
      }
    } else if (typeof error === 'string') {
      message = error
    } else {
      message = t('unknownError')
    }
  }

  return [message, setError]
}
