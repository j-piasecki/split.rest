import { SnackBarProvider } from '@components/SnackBar'
import { useFonts } from '@hooks/useFonts'
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { queryClient } from '@utils/queryClient'
import { useLocales } from 'expo-localization'
import { Stack, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import 'utils/firebase'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 250,
  fade: true,
})

function Content() {
  const pathname = usePathname()
  const user = useAuth(!pathname.startsWith('/join'))
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const locales = useLocales()
  const { t } = useTranslation()
  const [fontsLoaded, _error] = useFonts()

  const isLoading = user === undefined || !fontsLoaded

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

  useEffect(() => {
    i18n.changeLanguage(locales[0].languageCode!)
  }, [locales])

  // TODO: combine this with loading assets
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide()
    }
  }, [isLoading])

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
        <ActivityIndicator size='small' color={theme.colors.onSurface} />
      </View>
    )
  }

  const modalOptions: Record<string, unknown> = {
    presentation: isSmallScreen ? 'card' : 'transparentModal',
    animation: isSmallScreen ? undefined : 'fade',
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <SnackBarProvider>
        <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
          <Stack.Screen name='index' options={{ title: t('appName'), animation: 'none' }} />
          <Stack.Screen name='home' options={{ title: t('appName'), animation: 'none' }} />
          <Stack.Screen name='group/[id]/index' options={{ title: t('screenName.group') }} />
          <Stack.Screen name='group/[id]/members' options={{ title: t('screenName.members') }} />
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
            name='group/[id]/addUser'
            options={{ title: t('screenName.addUser'), ...modalOptions }}
          />
          <Stack.Screen
            name='group/[id]/addSplit'
            options={{ title: 'Add split', ...modalOptions }}
          />
          <Stack.Screen
            name='group/[id]/roulette'
            options={{ title: t('screenName.roulette'), ...modalOptions }}
          />
          <Stack.Screen
            name='group/[id]/settings'
            options={{ title: t('screenName.groupSettings'), ...modalOptions }}
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
      </SnackBarProvider>
    </NavigationThemeProvider>
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
