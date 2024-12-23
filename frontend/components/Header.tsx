import { ProfilePicture } from './ProfilePicture'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeaderProps {}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon-round-transparent.png')

export default function Header(_props: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View
      style={{
        height: 60 + insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: insets.top,
      }}
    >
      <Link href='/'>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={icon} style={{ width: 32, height: 32 }} tintColor={theme.colors.primary} />
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: theme.colors.primary,
              letterSpacing: 1,
            }}
          >
            {t('appName')}
            <Text style={{ color: theme.colors.outline, fontWeight: '400', letterSpacing: 0 }}>
              .rest
            </Text>
          </Text>
        </View>
      </Link>

      <Pressable onPress={() => router.navigate('/profile')}>
        <ProfilePicture userId={user?.id} size={32} />
      </Pressable>
    </View>
  )
}
