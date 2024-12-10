import apiErrors from '../locales/en/apiErrors.json'
import translation from '../locales/en/translation.json'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const defaultNS = 'translation'
export const resources = {
  en: {
    translation: translation,
    apiErrors: apiErrors,
  },
}

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: true,
  ns: ['translation', 'apiErrors'],
  supportedLngs: ['en'],
  resources,
  defaultNS,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

export default i18n
