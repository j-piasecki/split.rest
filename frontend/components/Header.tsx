import { logout } from '@utils/auth'
import { Link } from 'expo-router'
import { Button, Text, View } from 'react-native'

export interface HeaderProps {
  title: string
}

export default function Header(props: HeaderProps) {
  return (
    <View
      style={{
        backgroundColor: '#eee',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 32,
      }}
    >
      <Link href='/'>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          Split
        </Text>
      </Link>

      <Button title='Logout' onPress={logout} />
    </View>
  )
}
