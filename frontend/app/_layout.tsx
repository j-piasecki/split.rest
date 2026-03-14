import { ErrorBoundary } from '@components/ErrorBoundary'
import { ModalScreenOpaqueContextProvider } from '@components/ModalScreen'
import { SnackBarProvider } from '@components/SnackBar'
import { SpinningLogo } from '@components/SpinningLogo'
import { useFonts } from '@hooks/useFonts'
import { useNotificationListener } from '@hooks/useNotificationListener'
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
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

// TODO: The current setup with this results in index redirecting back to group screen after a deep link
// Without this, group navigation works, but join links close the app after navigating back
export const unstable_settings = {
  initialRouteName: 'index',
}

function Content() {
  const pathname = usePathname()
  const segments = useSegments()
  const { user, serverDown } = useAuth()
  const theme = useTheme()
  const locales = useLocales()
  const { t } = useTranslation()
  const [fontsLoaded, _error] = useFonts()

  const [loadingVisible, setLoadingVisible] = useState(Platform.OS === 'web')
  const loadingOpacity = useSharedValue(1)

  const [hasLoaded, setHasLoaded] = useState(false)
  const isDependenciesLoading = (user === undefined && !serverDown) || !fontsLoaded || !theme.ready
  const isLoading = hasLoaded ? false : isDependenciesLoading

  useEffect(() => {
    if (!isLoading) {
      setHasLoaded(true)
    }
  }, [isLoading])

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
      setTimeout(() => {
        SplashScreen.hide()
      }, 100)
    }
  }, [isLoading])

  useEffect(() => {
    logScreenView(pathname, segments.join('/'))
  }, [segments, pathname])

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <ModalScreenOpaqueContextProvider>
          <NavigationThemeProvider value={navigationTheme}>
            <SnackBarProvider>
              <ErrorBoundary>
                {!isLoading && (
                  <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
                    <Stack.Protected guard={!user}>
                      <Stack.Screen
                        name='index'
                        options={{ title: t('appName'), animation: 'none' }}
                      />
                    </Stack.Protected>

                    <Stack.Protected guard={!!user}>
                      <Stack.Screen name='(app)' options={{ animation: 'none' }} />
                    </Stack.Protected>
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
        </ModalScreenOpaqueContextProvider>
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
