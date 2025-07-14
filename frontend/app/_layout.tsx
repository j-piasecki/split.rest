import { ErrorBoundary } from '@components/ErrorBoundary'
import { SnackBarProvider } from '@components/SnackBar'
import { SpinningLogo } from '@components/SpinningLogo'
import { useFonts } from '@hooks/useFonts'
import { useNotificationListener } from '@hooks/useNotificationListener'
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { queryClient } from '@utils/queryClient'
import { useLocales } from 'expo-localization'
import { Stack, usePathname, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import 'utils/firebase'
import { logScreenView } from 'utils/firebase'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 250,
  fade: true,
})

Sentry.init({
  dsn: 'https://e70b6f5ed01c5af9180f540a254f551b@o4509667611639808.ingest.de.sentry.io/4509667612819536',
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})

function Content() {
  const pathname = usePathname()
  const segments = useSegments()
  const user = useAuth(
    !pathname.startsWith('/join') &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/privacyPolicy')
  )
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const locales = useLocales()
  const { t } = useTranslation()
  const [fontsLoaded, _error] = useFonts()

  const [loadingVisible, setLoadingVisible] = useState(Platform.OS === 'web')
  const loadingOpacity = useSharedValue(1)

  const isLoading = user === undefined || !fontsLoaded || !theme.ready

  const loadingStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
    }
  })

  useEffect(() => {
    if (!isLoading && Platform.OS === 'web') {
      loadingOpacity.value = withDelay(
        50,
        withTiming(0, { duration: 100 }, () => {
          runOnJS(setLoadingVisible)(false)
        })
      )
    }
  }, [isLoading, loadingOpacity])

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.surface,
      },
    }),
    [theme.colors.surface]
  )

  useNotificationListener()

  useEffect(() => {
    i18n.changeLanguage(locales[0].languageCode!)
  }, [locales])

  // TODO: combine this with loading assets
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide()
    }
  }, [isLoading])

  useEffect(() => {
    logScreenView(pathname, segments.join('/'))
  }, [segments, pathname])

  const modalOptions: Record<string, unknown> = {
    presentation: isSmallScreen ? 'card' : 'transparentModal',
    animation: isSmallScreen ? undefined : 'fade',
  }

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <NavigationThemeProvider value={navigationTheme}>
          <SnackBarProvider>
            <ErrorBoundary>
              {!isLoading && (
                <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
                  <Stack.Screen name='index' options={{ title: t('appName'), animation: 'none' }} />
                  <Stack.Screen name='home' options={{ title: t('appName'), animation: 'none' }} />
                  <Stack.Screen name='login' options={{ title: t('appName'), animation: 'none' }} />
                  <Stack.Screen
                    name='group/[id]/index'
                    options={{ title: t('screenName.group') }}
                  />
                  <Stack.Screen
                    name='group/[id]/members'
                    options={{ title: t('screenName.members') }}
                  />
                  <Stack.Screen
                    name='group/[id]/settleUp'
                    options={{ title: t('screenName.settleUp'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/member/[memberId]'
                    options={{ title: t('screenName.memberInfo'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/filter'
                    options={{ title: t('screenName.filter'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='createGroup'
                    options={{
                      title: t('screenName.createGroup'),
                      ...modalOptions,
                    }}
                  />
                  <Stack.Screen
                    name='profile'
                    options={{ title: t('screenName.profile'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/inviteMember'
                    options={{ title: t('screenName.inviteMember'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/addSplit'
                    options={{ title: t('screenName.addSplit'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/roulette'
                    options={{ title: t('screenName.roulette'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/settings'
                    options={{ title: t('screenName.groupSettings.index'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/split/[splitId]/index'
                    options={{ title: t('screenName.splitInfo'), ...modalOptions }}
                  />
                  <Stack.Screen
                    name='group/[id]/split/[splitId]/edit'
                    options={{ title: t('screenName.editSplit'), ...modalOptions }}
                  />
                </Stack>
              )}

              {loadingVisible && (
                <Animated.View
                  style={[
                    {
                      backgroundColor: theme.colors.surfaceDim,
                      pointerEvents: 'none',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                    StyleSheet.absoluteFillObject,
                    loadingStyle,
                  ]}
                >
                  <SpinningLogo />
                </Animated.View>
              )}
            </ErrorBoundary>
          </SnackBarProvider>
        </NavigationThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}

export default Sentry.wrap(function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Content />
      </ThemeProvider>
    </QueryClientProvider>
  )
})
