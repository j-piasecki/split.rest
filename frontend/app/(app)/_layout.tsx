import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function AppLayout() {
  const { t } = useTranslation()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const modalOptions: Record<string, unknown> = {
    presentation: isSmallScreen ? 'card' : 'transparentModal',
    animation: isSmallScreen ? undefined : 'none',
  }

  // This renders the navigation stack for all authenticated app routes.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name='index' options={{ title: t('appName'), animation: 'none' }} />
      <Stack.Screen
        name='groupInvites'
        options={{ title: t('screenName.groupInvites'), ...modalOptions }}
      />
      <Stack.Screen
        name='createGroup'
        options={{
          title: t('screenName.createGroup'),
          ...modalOptions,
        }}
      />
      <Stack.Screen
        name='profile'
        options={{ title: t('screenName.profile.index'), ...modalOptions }}
      />
    </Stack>
  )
}
