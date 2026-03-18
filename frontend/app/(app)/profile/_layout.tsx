import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useAppLayout } from '@utils/dimensionUtils'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

const transparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
}

export default function ProfileFlow() {
  const { t } = useTranslation()
  const { modalsInRightPanel } = useAppLayout()

  return (
    <ThemeProvider value={transparentNavTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          fullScreenGestureEnabled: true,
          animation: modalsInRightPanel ? 'none' : 'default',
          presentation: modalsInRightPanel ? 'transparentModal' : 'card',
        }}
      >
        <Stack.Screen name='index' options={{ title: t('screenName.profile.index') }} />
        <Stack.Screen name='appearance' options={{ title: t('screenName.profile.appearance') }} />
        <Stack.Screen name='account' options={{ title: t('screenName.profile.account') }} />
      </Stack>
    </ThemeProvider>
  )
}
