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

export default function SettleUpFlow() {
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
        <Stack.Screen name='index' options={{ title: t('screenName.settleUpMethod') }} />
        <Stack.Screen name='confirm' options={{ title: t('screenName.settleUp') }} />
      </Stack>
    </ThemeProvider>
  )
}
