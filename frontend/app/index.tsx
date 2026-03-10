import { Icon } from '@components/Icon'
import { SignInButton, SignInMethod } from '@components/SignInButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { signInWithApple, signInWithGoogle, useAuth } from '@utils/auth'
import { queryClient } from '@utils/queryClient'
import { setClaimRedirect, setJoinRedirect } from '@utils/startNavigationHelper'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ServerDown() {
  const theme = useTheme()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { t } = useTranslation()
  const { firebaseUser } = useAuth()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey: ['user', firebaseUser.uid] })
      }
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [firebaseUser])

  return (
    <View style={{ padding: 16, alignItems: 'center', gap: 32 }}>
      <Icon name='powerOff' size={80} color={theme.colors.onSurface} />
      <Text style={{ fontSize: 18, textAlign: 'center', color: theme.colors.onSurface }}>
        {t('api.serverIsNotResponding')}
      </Text>
    </View>
  )
}

export default function Screen() {
  const { user, serverDown } = useAuth()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { joinUuid, claimCode } = useLocalSearchParams()
  const { width, height } = useWindowDimensions()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (joinUuid) {
      setJoinRedirect(joinUuid as string)
    }
  }, [joinUuid])

  useEffect(() => {
    if (claimCode) {
      setClaimRedirect(claimCode as string)
    }
  }, [claimCode])

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
        {user === undefined && !serverDown && (
          <View style={{ padding: 16, alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size='small' color={theme.colors.onSurface} />
            <Text style={{ fontSize: 18, textAlign: 'center', color: theme.colors.onSurface }}>
              {t('checkingIfYouAreLoggedIn')}
            </Text>
          </View>
        )}
        {serverDown && <ServerDown />}
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
                  components={{
                    Styled: <Text style={{ color: theme.colors.primary, fontWeight: 700 }} />,
                  }}
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
              <View style={{ gap: 16 }}>
                <SignInButton
                  method={SignInMethod.Google}
                  disabled={signingIn}
                  onPress={async () => {
                    setSigningIn(true)
                    try {
                      await signInWithGoogle()
                    } catch (error) {
                      console.error('Failed to sign in with Google', error)
                    } finally {
                      setSigningIn(false)
                    }
                  }}
                />
                <SignInButton
                  method={SignInMethod.Apple}
                  disabled={signingIn}
                  onPress={async () => {
                    setSigningIn(true)
                    try {
                      await signInWithApple()
                    } catch (error) {
                      console.error('Failed to sign in with Apple', error)
                    } finally {
                      setSigningIn(false)
                    }
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
