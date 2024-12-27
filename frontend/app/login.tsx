import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'

// TODO: safe area

export default function Screen() {
  const user = useAuth(false)
  const theme = useTheme()
  const { t } = useTranslation()
  const { join } = useLocalSearchParams()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
      }}
    >
      {user === undefined && (
        <View>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
          <Text style={{ margin: 8, color: theme.colors.onSurface }}>
            {t('checkingIfYouAreLoggedIn')}
          </Text>
        </View>
      )}
      {user === null && (
        <View>
          <Text style={{ color: theme.colors.outline, fontSize: 18, textAlign: 'center' }}>
            (This is login screen)
          </Text>
          <Button title={t('signIn')} onPress={login} leftIcon='login' />
        </View>
      )}
      {user && !join && <Redirect href='/home' withAnchor />}
      {user && join && <Redirect href={`/join/${join}`} withAnchor />}
    </View>
  )
}
