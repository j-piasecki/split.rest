import { useTheme } from '@styling/theme'
import { logout } from '@utils/auth'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from './Button'

export interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Split' }: HeaderProps) {
  const theme = useTheme()

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceContainer,
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
            color: theme.colors.onSurface,
          }}
        >
          {title}
        </Text>
      </Link>

      <Button title='Logout' onPress={logout} />
    </View>
  )
}
