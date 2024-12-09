import { ThemeProvider, useTheme } from '@styling/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { queryClient } from '@utils/queryClient'
import { Stack, usePathname } from 'expo-router'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import 'utils/firebase'

function Content() {
  const pathname = usePathname()
  const user = useAuth(!pathname.startsWith('/join'))
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()

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
            title: 'Split - create group',
            ...modalOptions,
          }}
        />
        <Stack.Screen name='group/[id]/index' options={{ title: 'Group' }} />
        <Stack.Screen name='group/[id]/addUser' options={{ title: 'Add user', ...modalOptions }} />
        <Stack.Screen
          name='group/[id]/addSplit'
          options={{ title: 'Add split', ...modalOptions }}
        />
        <Stack.Screen name='group/[id]/roulette' options={{ title: 'Roulette', ...modalOptions }} />
        <Stack.Screen name='group/[id]/settings' options={{ title: 'Settings', ...modalOptions }} />
        <Stack.Screen
          name='group/[id]/split/[splitId]/index'
          options={{ title: 'Split', ...modalOptions }}
        />
        <Stack.Screen
          name='group/[id]/split/[splitId]/edit'
          options={{ title: 'Edit split', ...modalOptions }}
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
