import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { translation } from 'shared'

export const defaultNS = 'translation'
export const resources = {
  en: {
    translation: translation,
  },
}

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: __DEV__,
  ns: ['translation'],
  supportedLngs: ['en'],
  resources,
  defaultNS,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

export default i18n
