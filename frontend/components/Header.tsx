import { Button } from './Button'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { logout, useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Link } from 'expo-router'
import { Image, Text, View } from 'react-native'

export interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Split.rest' }: HeaderProps) {
  const theme = useTheme()
  const user = useAuth()

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
            fontSize: 28,
            fontWeight: '500',
            color: theme.colors.primary,
          }}
        >
          {title}
        </Text>
      </Link>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Button
          title='Logout'
          onPress={logout}
          rightIcon={
            <MaterialIcons name='logout' size={20} color={theme.colors.onPrimaryContainer} />
          }
        />
        <Image
          source={{ uri: getProfilePictureUrl(user?.id) }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
        />
      </View>
    </View>
  )
}
