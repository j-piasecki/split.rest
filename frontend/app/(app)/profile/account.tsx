import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { deleteUser, logout, reauthenticate } from '@utils/auth'
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
  const router = useRouter()
  const insets = useModalScreenInsets()
  const displayClass = useDisplayClass()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  return (
    <ModalScreen
      returnPath='/profile'
      title={t('screenName.profile.account')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
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
          <View style={{ gap: 16 }}>
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
          </View>
        </ScrollView>
        <DeleteAccountModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
        />
      </>
    </ModalScreen>
  )
}
