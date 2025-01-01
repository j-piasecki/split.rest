import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Picker } from '@components/Picker'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { ThemeType } from '@type/theme'
import { logout, useAuth } from '@utils/auth'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { User } from 'shared'

function Form({ user }: { user: User }) {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
      }}
    >
      <View style={{ gap: 16, alignItems: 'center', width: '90%' }}>
        <ProfilePicture userId={user?.id} size={96} />
        <Text style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
        <Text style={{ fontSize: 24, fontWeight: '600', color: theme.colors.onSurface }}>
          {user?.name}
        </Text>
        <Picker
          hint={t('settings.theme.hint')}
          style={{ width: '100%' }}
          selectedItem={theme.userSelectedTheme ?? 'system'}
          items={[
            { label: t('settings.theme.light'), value: 'light' },
            { label: t('settings.theme.dark'), value: 'dark' },
            { label: t('settings.theme.system'), value: 'system' },
          ]}
          onSelectionChange={(selected) => {
            if (selected === 'system') {
              theme.setTheme(null)
            } else {
              theme.setTheme(selected as ThemeType)
            }
          }}
        />
      </View>
      <View style={{ width: '100%' }}>
        <Button
          title={t('signOut')}
          onPress={() => {
            router.dismissAll()
            router.replace('/login')
            logout()
          }}
          rightIcon='logout'
        />
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const user = useAuth()
  const theme = useTheme()
  return (
    <ModalScreen returnPath='/home' title={t('screenName.profile')} maxWidth={400} maxHeight={500}>
      {!user && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
      {user && <Form user={user} />}
    </ModalScreen>
  )
}
