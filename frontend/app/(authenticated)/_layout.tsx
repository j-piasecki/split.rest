import { useAuth } from '@utils/auth'
import { Stack } from 'expo-router'
import { Text } from 'react-native'

export default function App() {
  const user = useAuth()

  if (user === undefined) {
    return <Text>Loading...</Text>
  }

  const modalOptions: Record<string, unknown> = {
    presentation: 'transparentModal',
    animation: 'fade',
    headerShown: false,
  }

  return (
    <Stack>
      <Stack.Screen name='home' options={{ title: 'Split' }} />
      <Stack.Screen
        name='createGroup'
        options={{
          title: 'Split - create group',
          ...modalOptions,
        }}
      />
      <Stack.Screen name='[id]' options={{ title: 'Group' }} />
      <Stack.Screen name='[id]/addUser' options={{ title: 'Add user', ...modalOptions }} />
      <Stack.Screen name='[id]/addSplit' options={{ title: 'Add split', ...modalOptions }} />
    </Stack>
  )
}
