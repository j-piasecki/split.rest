import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useTranslation } from 'react-i18next'
import { LanguageTranslationKey } from 'shared'

export type ErrorTextProps =
  | {
      translationKey: LanguageTranslationKey
    }
  | {
      children: React.ReactNode
    }

export function ErrorText(props: ErrorTextProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Text
      style={{
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 500,
      }}
    >
      {'translationKey' in props ? t(props.translationKey) : props.children}
    </Text>
  )
}
