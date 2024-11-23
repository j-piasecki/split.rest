import { ThemeProvider } from '@styling/theme'
import { Stack } from 'expo-router'
import React from 'react'
import 'utils/firebase'

function Content() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ title: 'Split' }} />
      <Stack.Screen name='home' options={{ title: 'Split' }} />
      <Stack.Screen name='group/[group]' options={{ title: 'Group' }} />
      <Stack.Screen
        name='createGroup'
        options={{
          title: 'Split - create group',
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
      {/* <Stack.Screen name='index' options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen
        name='newCounter'
        options={{
          title: 'New counter',
          ...headerStyle,
          ...modalStyle,
        }}
      />
      <Stack.Screen
        name='settings'
        options={{ title: 'Settings', ...headerStyle, ...modalStyle }}
      /> */}
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
