import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'

const transparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
}

export default function AddFlow() {
  const { t } = useTranslation()
  const isSmallScreen = useDisplayClass() <= DisplayClass.Expanded

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: '#000000a0' }}
      entering={isSmallScreen ? undefined : FadeIn.duration(100)}
    >
      <ThemeProvider value={transparentNavTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            fullScreenGestureEnabled: true,
            animation: isSmallScreen ? 'default' : 'none',
          }}
        >
          <Stack.Screen name='index' options={{ title: t('screenName.groupSettings.index') }} />
          <Stack.Screen
            name='invitations'
            options={{ title: t('screenName.groupSettings.invitations') }}
          />
          <Stack.Screen
            name='resolveDelayed'
            options={{ title: t('screenName.groupSettings.resolveDelayed') }}
          />
          <Stack.Screen
            name='allowedSplitMethods'
            options={{ title: t('screenName.groupSettings.splitMethods') }}
          />
          <Stack.Screen
            name='wrapGroup'
            options={{ title: t('screenName.groupSettings.wrapItUp') }}
          />
          <Stack.Screen
            name='joinQrCode'
            options={{ title: t('screenName.groupSettings.joinQrCode') }}
          />
        </Stack>
      </ThemeProvider>
    </Animated.View>
  )
}
