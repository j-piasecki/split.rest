import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { queryClient } from '@utils/queryClient'
import { useLocales } from 'expo-localization'
import { Stack, usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import 'utils/firebase'

function Content() {
  const pathname = usePathname()
  const user = useAuth(!pathname.startsWith('/join'))
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()
  const locales = useLocales()
  const { t } = useTranslation()

  useEffect(() => {
    i18n.changeLanguage(locales[0].languageCode!)
  }, [locales])

  if (user === undefined) {
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
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
        <Stack.Screen name='index' options={{ title: 'Split' }} />
        <Stack.Screen name='home' options={{ title: 'Split', animation: 'none' }} />
        <Stack.Screen
          name='createGroup'
          options={{
            title: t('screenName.createGroup'),
            ...modalOptions,
          }}
        />
        <Stack.Screen name='group/[id]/index' options={{ title: t('screenName.group') }} />
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
    </View>
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
