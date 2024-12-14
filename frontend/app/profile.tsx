import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { logout, useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text, View } from 'react-native'
import { User } from 'shared'

function Form({ user }: { user: User }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
      }}
    >
      <View style={{ gap: 16, alignItems: 'center' }}>
        <Image
          source={{ uri: getProfilePictureUrl(user?.id) }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
        <Text style={{ fontSize: 24, fontWeight: '600', color: theme.colors.onSurface }}>
          {user?.name}
        </Text>
      </View>
      <View style={{ width: '100%' }}>
        <Button
          title={t('signOut')}
          onPress={logout}
          rightIcon={
            <MaterialIcons name='logout' size={20} color={theme.colors.onPrimaryContainer} />
          }
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
    <ModalScreen returnPath='/home' title={t('screenName.profile')} maxWidth={400} maxHeight={400}>
      {!user && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
      {user && <Form user={user} />}
    </ModalScreen>
  )
}
