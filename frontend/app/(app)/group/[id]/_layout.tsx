import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function GroupFlow() {
  const { t } = useTranslation()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small

  const modalOptions: Record<string, unknown> = {
    presentation: isSmallScreen ? 'card' : 'transparentModal',
    animation: isSmallScreen ? undefined : 'none',
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name='index' options={{ title: t('screenName.group'), animation: 'none' }} />
      <Stack.Screen name='members' options={{ title: t('screenName.members'), ...modalOptions }} />
      <Stack.Screen
        name='settleUp'
        options={{ title: t('screenName.settleUp'), ...modalOptions }}
      />
      <Stack.Screen
        name='member/[memberId]/index'
        options={{ title: t('screenName.memberInfo'), ...modalOptions }}
      />
      <Stack.Screen
        name='member/[memberId]/settleUpExactAmount'
        options={{ title: t('screenName.settleUpExactAmount'), ...modalOptions }}
      />
      <Stack.Screen name='filter' options={{ title: t('screenName.filter'), ...modalOptions }} />
      <Stack.Screen
        name='addMember'
        options={{ title: t('screenName.addMember'), ...modalOptions }}
      />
      <Stack.Screen
        name='addSplit'
        options={{ title: t('screenName.addSplit'), ...modalOptions }}
      />
      <Stack.Screen
        name='settings'
        options={{ title: t('screenName.groupSettings.index'), ...modalOptions }}
      />
      <Stack.Screen
        name='trends'
        options={{ title: t('screenName.groupStats'), ...modalOptions }}
      />
      <Stack.Screen
        name='split/[splitId]/index'
        options={{ title: t('screenName.splitInfo'), ...modalOptions }}
      />
      <Stack.Screen
        name='split/[splitId]/edit'
        options={{ title: t('screenName.editSplit'), ...modalOptions }}
      />
    </Stack>
  )
}
