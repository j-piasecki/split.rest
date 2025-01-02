import { SignInWithGoogleButton } from '@components/SignInWithGoogleButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { login, useAuth } from '@utils/auth'
import { Image } from 'expo-image'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Screen() {
  const user = useAuth(false)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { join } = useLocalSearchParams()
  const { width, height } = useWindowDimensions()

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
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: theme.colors.primaryContainer,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderTopWidth: height / 2,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: width,
          borderTopColor: theme.colors.primaryContainer,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
      />
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
          <View style={{ padding: 16, paddingTop: height / 4 - 80, alignItems: 'center', gap: 24 }}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('@assets/icon.svg')}
              style={{ width: 160, height: 160 }}
              tintColor={theme.colors.primary}
              // Android wasn't updating the tint correctly
              key={theme.colors.primary}
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
              <Trans
                i18nKey='login.youMustSignIn'
                components={{ Styled: <Text style={{ color: theme.colors.primary }} /> }}
              />
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <SignInWithGoogleButton onPress={login} />
          </View>
        </View>
      )}
      {user && !join && <Redirect href='/home' withAnchor />}
      {user && join && <Redirect href={`/join/${join}`} withAnchor />}
    </View>
  )
}
