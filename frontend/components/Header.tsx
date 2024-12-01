import { Button } from './Button'
import { getProfilePicture } from '@database/getProfilePicture'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { logout, useAuth } from '@utils/auth'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'

export interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Split' }: HeaderProps) {
  const theme = useTheme()
  const user = useAuth()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getProfilePicture(user.photoURL).then(setProfilePicture)
    }
  }, [user])

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
            color: theme.colors.onPrimaryContainer,
          }}
        >
          {title}
        </Text>
      </Link>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Button
          title='Logout'
          onPress={logout}
          rightIcon={<MaterialIcons name='logout' size={20} color={theme.colors.onPrimaryContainer} />}
        />
        <Image
          source={{ uri: profilePicture ?? undefined }}
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
