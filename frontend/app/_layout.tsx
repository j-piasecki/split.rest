import { ErrorBoundary } from '@components/ErrorBoundary'
import { SnackBarProvider } from '@components/SnackBar'
import { SpinningLogo } from '@components/SpinningLogo'
import { useFonts } from '@hooks/useFonts'
import { useNotificationListener } from '@hooks/useNotificationListener'
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { queryClient } from '@utils/queryClient'
import { useLocales } from 'expo-localization'
import { Stack, usePathname, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import 'utils/firebase'
import { logScreenView } from 'utils/firebase'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 250,
  fade: true,
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

  const isLoading = user === undefined || !fontsLoaded || !theme.ready

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

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceDim,
        }}
      >
        <SpinningLogo />
      </View>
    )
  }

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
              <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
                <Stack.Screen name='index' options={{ title: t('appName'), animation: 'none' }} />
                <Stack.Screen name='home' options={{ title: t('appName'), animation: 'none' }} />
                <Stack.Screen name='login' options={{ title: t('appName'), animation: 'none' }} />
                <Stack.Screen name='group/[id]/index' options={{ title: t('screenName.group') }} />
                <Stack.Screen
                  name='group/[id]/members'
                  options={{ title: t('screenName.members') }}
                />
                <Stack.Screen
                  name='group/[id]/member/[memberId]'
                  options={{ title: t('screenName.memberInfo'), ...modalOptions }}
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
            </ErrorBoundary>
          </SnackBarProvider>
        </NavigationThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Content />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
