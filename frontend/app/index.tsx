import { login, useAuth } from '@utils/auth'
import { Redirect } from 'expo-router'
import { ActivityIndicator, Button, Text, View } from 'react-native'

export default function Screen() {
  const user = useAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user === undefined && (
        <View>
          <ActivityIndicator size='small' />
          <Text>Checking if you're logged in</Text>
        </View>
      )}
      {user === null && <Button title='Login' onPress={login} />}
      {user && <Redirect href='/home' withAnchor />}
    </View>
  )
}
