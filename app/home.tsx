import { logout } from '@utils/auth'
import { Button, Text, View } from 'react-native'

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home</Text>
      <Button title='Logout' onPress={logout} />
    </View>
  )
}
