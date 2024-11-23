import { logout, useAuth } from '@utils/auth'
import { Link, usePathname, useRouter } from 'expo-router'
import { Button, Text, View } from 'react-native'

export default function Home() {
  useAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home</Text>
      <Button title='Logout' onPress={logout} />

      <Link href='/createGroup' asChild>
        <Button title='Create Group' />
      </Link>
    </View>
  )
}
