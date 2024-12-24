import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'

const transparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000a0',
  },
}

export default function AddFlow() {
  return (
    <ThemeProvider value={transparentNavTheme}>
      <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }}>
        <Stack.Screen name='index' options={{ title: 'Add split' }} />
      </Stack>
    </ThemeProvider>
  )
}
