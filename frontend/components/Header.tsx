import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Link, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface HeaderProps {
  title?: string
}

export default function Header(props: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()

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

      <Pressable onPress={() => router.navigate('/profile')}>
        <Image
          source={{ uri: getProfilePictureUrl(user?.id) }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
        />
      </Pressable>
    </View>
  )
}
