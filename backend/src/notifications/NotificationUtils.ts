import { sendNotification } from './sendNotification'
import i18n from 'i18next'
import { AndroidNotificationChannel, LanguageTranslationKey, translation } from 'shared'

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

interface Notification {
  token: Token
  title: StringOrTranslatable
  body?: StringOrTranslatable
  data?: Record<string, string>
  androidChannel?: AndroidNotificationChannel
}

export default class NotificationUtils {
  static async sendNotification(notification: Notification) {
    const titleToSend = getString(notification.title, notification.token.language)
    const bodyToSend = notification.body
      ? getString(notification.body, notification.token.language)
      : undefined

    return await sendNotification(
      notification.token.token,
      titleToSend,
      bodyToSend,
      notification.data,
      notification.androidChannel
    )
  }
}
