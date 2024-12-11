import { Button } from './Button'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { logout, useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface HeaderProps {
  title?: string
}

export default function Header(props: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceContainer,
        height: 60 + insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: insets.top,
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
          {props.title || t('appName')}
        </Text>
      </Link>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Button
          title={t('signOut')}
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
