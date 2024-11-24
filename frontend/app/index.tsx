import { login, useAuth } from '@utils/auth'
import { Redirect } from 'expo-router'
import { Button, Text, View } from 'react-native'

export default function Screen() {
  const user = useAuth()

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20 }}>Split</Text>
      {user === undefined && <Text>Loading...</Text>}
      {user === null && <Button title='Login' onPress={login} />}
      {user && <Redirect href='/home' withAnchor />}
    </View>
  )
}
