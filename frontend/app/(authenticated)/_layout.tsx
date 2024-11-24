import { useAuth } from '@utils/auth'
import { isSmallScreen } from '@utils/isSmallScreen'
import { Stack } from 'expo-router'
import { Text, useWindowDimensions } from 'react-native'

export default function App() {
  const user = useAuth()
  const windowSize = useWindowDimensions()

  if (user === undefined) {
    return <Text>Loading...</Text>
  }

  const modalOptions: Record<string, unknown> = {
    presentation: isSmallScreen(windowSize.width) ? 'card' : 'transparentModal',
    animation: 'fade',
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='home' options={{ title: 'Split' }} />
      <Stack.Screen
        name='createGroup'
        options={{
          title: 'Split - create group',
          ...modalOptions,
        }}
      />
      <Stack.Screen name='[id]/index' options={{ title: 'Group' }} />
      <Stack.Screen name='[id]/addUser' options={{ title: 'Add user', ...modalOptions }} />
      <Stack.Screen name='[id]/addSplit' options={{ title: 'Add split', ...modalOptions }} />
    </Stack>
  )
}
