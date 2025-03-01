import { sendNotification } from './sendNotification'
import i18n from 'i18next'
import { LanguageTranslationKey, translation } from 'shared'

i18n.init({
  fallbackLng: 'en',
  debug: false,
  ns: ['translation'],
  supportedLngs: ['en'],
  resources: {
    en: {
      translation: translation,
    },
  },
  defaultNS: 'translation',
  interpolation: {
    escapeValue: true,
  },
})

type StringOrTranslatable = string | { key: LanguageTranslationKey; args?: Record<string, string> }
type Token = {
  token: string
  language: string
}

function getString(value: StringOrTranslatable, language: string) {
  if (typeof value === 'string') {
    return value
  }

  return i18n.t(value.key, { ...value.args, lng: language })
}

export default class NotificationUtils {
  static async sendNotification(
    token: Token,
    title: StringOrTranslatable,
    body?: StringOrTranslatable,
    data?: Record<string, string>
  ) {
    const titleToSend = getString(title, token.language)
    const bodyToSend = body ? getString(body, token.language) : undefined

    return await sendNotification(token.token, titleToSend, bodyToSend, data)
  }
}
