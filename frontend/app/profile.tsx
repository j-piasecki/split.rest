import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Picker } from '@components/Picker'
import { ProfilePicture } from '@components/ProfilePicture'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { ThemeType } from '@type/theme'
import { deleteUser, logout, reauthenticate, useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { User } from 'shared'

interface DeleteAccountModalProps {
  visible: boolean
  onClose: () => void
}

function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const theme = useTheme()
  const snack = useSnack()
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 16,
            margin: 8,
            maxWidth: 500,
            gap: 16,
          }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 22 }}>
            {t('settings.deleteAccount.doYouWantToDeleteAccount')}
          </Text>

          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
            {t('settings.deleteAccount.deletionNotReversible')}
          </Text>

          <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}
          >
            <Button title={t('settings.deleteAccount.cancel')} leftIcon='close' onPress={onClose} />
            <Button
              title={t('settings.deleteAccount.delete')}
              leftIcon='delete'
              isLoading={isDeleting}
              destructive
              onPress={async () => {
                setIsDeleting(true)
                deleteUser()
                  .then(() => {
                    onClose()
                    snack.show(t('settings.deleteAccount.accountDeleted'))
                  })
                  .catch(() => {
                    alert(t('api.auth.tryAgain'))
                  })
                  .finally(() => {
                    setIsDeleting(false)
                  })
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

function Form({ user }: { user: User }) {
  const theme = useTheme()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const { t } = useTranslation()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        gap: 16,
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
      <View style={{ width: '100%', flexDirection: 'column', gap: 16 }}>
        {/* Don't show delete button on web on small screen; it uses redirect to sign in which requires
         * special handling which is not implemented yet. This will break on browsers in mobile devices.
         * which use redirect to sign in on all display classes. */}
        {(Platform.OS !== 'web' || displayClass !== DisplayClass.Small) && (
          <Button
            destructive
            title={t('settings.deleteAccount.deleteAccount')}
            onPress={() => {
              // skip sign in with apple reauthentication on ios, it's done automatically
              // when refreshing token for revocation
              reauthenticate(Platform.OS === 'ios')
                .then(() => {
                  setDeleteModalVisible(true)
                })
                .catch(() => {
                  alert(t('api.auth.tryAgain'))
                })
            }}
            leftIcon='delete'
          />
        )}
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

      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      />
    </ScrollView>
  )
}

export default function ProfileScreen() {
  const { t } = useTranslation()
  const user = useAuth()
  const theme = useTheme()
  return (
    <ModalScreen returnPath='/home' title={t('screenName.profile')} maxWidth={400} maxHeight={550}>
      {!user && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
      {user && <Form user={user} />}
    </ModalScreen>
  )
}
