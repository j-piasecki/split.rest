import { useAuth } from "@utils/auth";
import { Stack } from "expo-router";
import { Text } from "react-native";

export default function App() {
  const user = useAuth()

  if (user === undefined) {
    return <Text>Loading...</Text>
  }

  return (
    <Stack>
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
    </Stack>
  )
}
