import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { deleteUser, logout, reauthenticate, useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { setLastOpenedGroupId } from '@utils/startNavigationHelper'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, View } from 'react-native'
import { TranslatableError } from 'shared'

interface DeleteAccountModalProps {
  visible: boolean
  onClose: () => void
}

function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const snack = useSnack()
  const { t } = useTranslation()

  return (
    <ConfirmationModal
      visible={visible}
      title='settings.deleteAccount.doYouWantToDeleteAccount'
      message='settings.deleteAccount.deletionNotReversible'
      confirmText='settings.deleteAccount.delete'
      confirmIcon='delete'
      cancelText='settings.deleteAccount.cancel'
      cancelIcon='close'
      destructive
      onClose={onClose}
      onConfirm={async () => {
        try {
          await deleteUser()
          snack.show({ message: t('settings.deleteAccount.accountDeleted') })
        } catch {
          throw new TranslatableError('api.auth.tryAgain')
        }
      }}
    />
  )
}

export default function AccountScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const displayClass = useDisplayClass()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  return (
    <ModalScreen
      returnPath='/profile'
      title={t('screenName.profile.account')}
      slideAnimation={false}
    >
      <>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
            paddingBottom: insets.bottom + 16,
            paddingTop: insets.top + 16,
            gap: 24,
          }}
        >
          <LargeTextInput
            value={user?.email ?? ''}
            placeholder={t('settings.email')}
            onChangeText={() => {}}
            disabled
          />

          {/* Don't show delete button on web on small screen; it uses redirect to sign in which requires
           * special handling which is not implemented yet. This will break on browsers in mobile devices.
           * which use redirect to sign in on all display classes. */}
          {Platform.OS !== 'web' || displayClass !== DisplayClass.Small ? (
            <View
              style={{
                borderColor: theme.colors.error,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                gap: 16,
              }}
            >
              <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: 500 }}>
                {t('settings.deleteAccount.explanation')}
              </Text>
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
            </View>
          ) : (
            <View />
          )}

          <View style={{ flex: 1 }} />

          <Button
            title={t('signOut')}
            onPress={async () => {
              setIsSigningOut(true)
              await logout()
              setLastOpenedGroupId(null)
              setIsSigningOut(false)
              router.dismissAll()
            }}
            isLoading={isSigningOut}
            rightIcon='logout'
          />
        </ScrollView>
        <DeleteAccountModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
        />
      </>
    </ModalScreen>
  )
}
