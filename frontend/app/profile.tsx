import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { EditableText } from '@components/EditableText'
import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { ProfilePicture } from '@components/ProfilePicture'
import { SegmentedButton } from '@components/SegmentedButton'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useSetUserNameMutation } from '@hooks/database/useSetUserName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import ImageEditor from '@react-native-community/image-editor'
import { useTheme } from '@styling/theme'
import { deleteUser, logout, reauthenticate, useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { ApiError, makeRequest, makeRequestWithFile } from '@utils/makeApiRequest'
import { invalidateUserById } from '@utils/queryClient'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native'
import { FileUploadArguments, TranslatableError, User, isTranslatableError } from 'shared'

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

function Form({ user }: { user: User }) {
  const theme = useTheme()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isChangingProfilePicture, setIsChangingProfilePicture] = useState(false)
  const { mutateAsync: setUserName, isPending: isChangingName } = useSetUserNameMutation()

  function setName(newName: string) {
    newName = newName.trim()

    if (newName.length === 0) {
      alert(t('api.user.nameCannotBeEmpty'))
      return
    }

    if (newName.length > 128) {
      alert(t('api.user.nameTooLong'))
      return
    }

    setUserName(newName).catch((e) => {
      if (e instanceof TranslatableError) {
        alert(t(e.message, e.args))
      } else {
        alert(t('unknownError'))
      }
    })
  }

  async function changeProfilePicture() {
    try {
      setIsChangingProfilePicture(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (result.canceled) {
        return
      }

      if (result.assets.length === 0 || !result.assets[0].uri) {
        throw new TranslatableError('settings.profilePicture.noImageSelected')
      }

      const width = result.assets[0].width
      const height = result.assets[0].height
      const size = Math.min(width, height)

      const image = await ImageEditor.cropImage(result.assets[0].uri, {
        offset: { x: (width - size) / 2, y: (height - size) / 2 },
        size: { width: size, height: size },
        displaySize: { width: 128, height: 128 },
      })

      if (Platform.OS === 'web') {
        await makeRequest<FileUploadArguments, void>('POST', 'setProfilePicture', {
          file: {
            type: image.type,
            uri: image.uri,
          },
        })
      } else {
        await makeRequestWithFile('POST', 'setProfilePicture', {
          file: {
            name: image.name,
            type: image.type,
            uri: image.uri,
          },
        })
      }

      await invalidateUserById(user.id)
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.statusCode === 429) {
          alert(t('settings.profilePicture.tooManyRequests'))
          return
        }

        alert(t(e.message, e.args))
      } else if (isTranslatableError(e)) {
        alert(t(e.message, e.args))
      } else {
        alert(t('api.auth.tryAgain'))
      }
    } finally {
      setIsChangingProfilePicture(false)
    }
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
        paddingTop: insets.top + 16,
        gap: 16,
      }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ gap: 24, alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={{ alignItems: 'center', gap: 4, alignSelf: 'stretch' }}>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Pressable onPress={changeProfilePicture}>
              <ProfilePicture user={user} size={128} />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.colors.surfaceContainerHighest,
                  borderRadius: 24,
                  padding: 4,
                }}
              >
                {isChangingProfilePicture ? (
                  <ActivityIndicator size='small' color={theme.colors.tertiary} />
                ) : (
                  <Icon name='upload' size={24} color={theme.colors.tertiary} />
                )}
              </View>
            </Pressable>
          </View>
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
        <SegmentedButton
          style={{ alignSelf: 'stretch' }}
          items={[
            {
              title: t('settings.theme.light'),
              icon: 'lightTheme',
              selected: theme.userSelectedTheme === 'light',
              onPress: () => theme.setTheme('light'),
            },
            {
              title: t('settings.theme.dark'),
              icon: 'darkTheme',
              selected: theme.userSelectedTheme === 'dark',
              onPress: () => theme.setTheme('dark'),
            },
            {
              title: t('settings.theme.system'),
              icon: 'systemTheme',
              selected: theme.userSelectedTheme === null,
              onPress: () => theme.setTheme(null),
            },
          ]}
        />
        {theme.isMaterialYouSupported() && (
          <SegmentedButton
            items={[
              {
                title: t('settings.theme.defaultColors'),
                icon: 'colors',
                selected: !theme.shouldUseMaterialYou,
                onPress: () => theme.setShouldUseMaterialYou(false),
              },
              {
                title: t('settings.theme.materialYouColors'),
                icon: 'palette',
                selected: theme.shouldUseMaterialYou,
                onPress: () => theme.setShouldUseMaterialYou(true),
              },
            ]}
          />
        )}
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
          onPress={async () => {
            setIsSigningOut(true)
            await logout()
            setIsSigningOut(false)
            router.dismissAll()
            router.replace('/login')
          }}
          isLoading={isSigningOut}
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
    <ModalScreen
      returnPath='/group/none'
      title={t('screenName.profile')}
      maxWidth={400}
      maxHeight={550}
    >
      {!user && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
      {user && <Form user={user} />}
    </ModalScreen>
  )
}
