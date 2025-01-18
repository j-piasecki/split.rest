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
          <Stack.Screen name='index' options={{ title: t('screenName.splitType') }} />
          <Stack.Screen name='edit' options={{ title: t('screenName.editSplit') }} />
          <Stack.Screen name='summary' options={{ title: t('screenName.splitSummary') }} />
          <Stack.Screen name='detailsStep' options={{ title: t('screenName.detailsStep') }} />
          <Stack.Screen name='exactAmounts' options={{ title: t('screenName.exactAmounts') }} />
          <Stack.Screen
            name='participantsStep'
            options={{ title: t('screenName.splitParticipants') }}
          />
        </Stack>
      </ThemeProvider>
    </Animated.View>
  )
}
