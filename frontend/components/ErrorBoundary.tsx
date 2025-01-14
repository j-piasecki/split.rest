import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { crashlytics } from '@utils/firebase'
import { useEffect } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  useEffect(() => {
    crashlytics.recordError(error)
  }, [error])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.primaryContainer,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name='bug' size={96} color={theme.colors.onPrimaryContainer} />
        <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 24, fontWeight: 600 }}>
          {t('errorBoundary.error')}
        </Text>
        <Button
          onPress={resetErrorBoundary}
          style={{ marginTop: 16, backgroundColor: theme.colors.onPrimaryContainer }}
          foregroundColor={theme.colors.primaryContainer}
          leftIcon='chevronBack'
          title={t('errorBoundary.tryAgain')}
        ></Button>
      </View>
    </View>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // don't do anything, root navigator will re-mount
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
