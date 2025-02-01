import { Button } from '@components/Button'
import { EditableText } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { Picker } from '@components/Picker'
import { ProfilePicture } from '@components/ProfilePicture'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useSetUserNameMutation } from '@hooks/database/useSetUserName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
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
import { TranslatableError, User } from 'shared'

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
                    snack.show({ message: t('settings.deleteAccount.accountDeleted') })
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
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const { mutateAsync: setUserName, isPending: isChangingName } = useSetUserNameMutation()

  function setName(newName: string) {
    if (newName.length === 0) {
      alert(t('api.user.nameTooLong'))
      return
    }

    if (newName.length > 128) {
      alert(t('api.user.nameTooLong'))
      return
    }

    setUserName(newName).catch((e) => {
      if (e instanceof TranslatableError) {
        alert(t(e.message))
      } else {
        alert(t('unknownError'))
      }
    })
  }

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
        paddingTop: insets.top + 32,
        gap: 16,
      }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ gap: 24, alignItems: 'center', paddingHorizontal: 16 }}>
        <ProfilePicture userId={user?.id} size={96} />
        <View style={{ alignItems: 'center', gap: 4, alignSelf: 'stretch' }}>
          <EditableText
            value={user?.name}
            placeholder={t('settings.username')}
            isPending={isChangingName}
            onSubmit={setName}
            style={{ alignSelf: 'stretch', justifyContent: 'center' }}
          />
          <Text style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}>
            {user?.email}
          </Text>
        </View>
        <Picker
          hint={t('settings.theme.hint')}
          style={{ alignSelf: 'stretch' }}
          selectedItem={theme.userSelectedTheme ?? 'system'}
          items={[
            { label: t('settings.theme.light'), value: 'light', icon: 'lightTheme' },
            { label: t('settings.theme.dark'), value: 'dark', icon: 'darkTheme' },
            { label: t('settings.theme.system'), value: 'system', icon: 'systemTheme' },
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
      <View style={{ flexDirection: 'column', gap: 16, marginTop: 24 }}>
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
