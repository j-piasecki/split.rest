import { SignInWithAppleButton } from '@components/SignInWithAppleButton'
import { SignInWithGoogleButton } from '@components/SignInWithGoogleButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { signInWithApple, signInWithGoogle, useAuth } from '@utils/auth'
import { Image } from 'expo-image'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Screen() {
  const user = useAuth(false)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { join } = useLocalSearchParams()
  const { width, height } = useWindowDimensions()
  const [signingIn, setSigningIn] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
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
          borderTopWidth: (height * 2) / 3,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: width,
          borderTopColor: theme.colors.primaryContainer,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
      />
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',

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
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View
              style={{
                flex: 1,
                padding: 12,
                paddingTop: height / 6,
                alignItems: 'center',
                gap: 24,
              }}
            >
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 40, fontWeight: 700, color: theme.colors.primary }}>
                  {t('appName')}
                  <Text style={{ color: theme.colors.outline }}>.rest</Text>
                </Text>
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  source={require('@assets/icon.svg')}
                  style={{ width: 160, height: 160 }}
                  tintColor={theme.colors.primary}
                />
              </View>
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
                padding: 16,
                paddingBottom: 100,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                pointerEvents: signingIn ? 'none' : 'auto',
              }}
            >
              {signingIn && (
                <ActivityIndicator
                  size='small'
                  color={theme.colors.onSurface}
                  style={{ marginBottom: 16 }}
                />
              )}
              <SignInWithGoogleButton
                onPress={async () => {
                  setSigningIn(true)
                  await signInWithGoogle()
                  setSigningIn(false)
                }}
              />
              <SignInWithAppleButton
                onPress={async () => {
                  setSigningIn(true)
                  await signInWithApple()
                  setSigningIn(false)
                }}
              />
            </View>
          </View>
        )}
        {/* TODO: handle this better, this flashes */}
        {user && !join && <Redirect href='/group/none' withAnchor />}
        {user && join && <Redirect href={`/join/${join}`} withAnchor />}
      </ScrollView>
    </View>
  )
}
