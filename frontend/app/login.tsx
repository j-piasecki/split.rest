import { SignInWithGoogleButton } from '@components/SignInWithGoogleButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { ImageBackground } from 'expo-image'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Screen() {
  const user = useAuth(false)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { join } = useLocalSearchParams()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
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
        <View style={{ flex: 1 }}>
          <View style={{ padding: 16, alignItems: 'center', gap: 24 }}>
            <ImageBackground
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('@assets/icon.svg')}
              style={{ width: 160, height: 160 }}
              tintColor={theme.colors.primary}
            />
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontSize: 24,
                fontWeight: 700,
                textAlign: 'center',
                padding: 16,
              }}
            >
              You must sign in before you can start{' '}
              <Text style={{ color: theme.colors.primary }}>splitting</Text>
            </Text>
          </View>
          <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <SignInWithGoogleButton onPress={login} />
            
          </View>
        </View>
      )}
      {user && !join && <Redirect href='/home' withAnchor />}
      {user && join && <Redirect href={`/join/${join}`} withAnchor />}
    </View>
  )
}
