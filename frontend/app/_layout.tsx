import { ThemeProvider } from '@styling/theme'
import { Stack } from 'expo-router'
import React from 'react'
import 'utils/firebase'

function Content() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' options={{ title: 'Split' }} />
    </Stack>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  )
}
