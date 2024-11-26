import { useTheme } from '@styling/theme'
import { logout } from '@utils/auth'
import { Link } from 'expo-router'
import { Button, Text, View } from 'react-native'

export interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Split' }: HeaderProps) {
  const theme = useTheme()

  return (
    <View
      style={{
        backgroundColor: theme.colors.backgroundElevated,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
      }}
    >
      <Link href='/'>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
          }}
        >
          {title}
        </Text>
      </Link>

      <Button title='Logout' onPress={logout} />
    </View>
  )
}
