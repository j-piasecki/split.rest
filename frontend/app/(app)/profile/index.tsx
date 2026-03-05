import { Icon } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { PaneButton } from '@components/PaneButton'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetUserNameMutation } from '@hooks/database/useSetUserName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import ImageEditor from '@react-native-community/image-editor'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { ApiError, makeRequest, makeRequestWithFile } from '@utils/makeApiRequest'
import { invalidateUserById } from '@utils/queryClient'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native'
import { FileUploadArguments, TranslatableError, User, isTranslatableError } from 'shared'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon.svg')

function DisplayNameSetter() {
  const theme = useTheme()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [value, setValue] = useState(user?.name ?? '')

  const { mutateAsync: setUserName, isPending: isChangingName } = useSetUserNameMutation()

  function saveDisplayName() {
    const newName = value.trim()

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

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <LargeTextInput
        placeholder={t('settings.username')}
        disabled={isChangingName}
        value={value ?? ''}
        onChangeText={setValue}
        containerStyle={{ flex: 1, paddingRight: 56 }}
        onSubmit={saveDisplayName}
      />
      <View
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {value !== null && value !== (user?.name ?? '') && (
          <RoundIconButton
            opaque
            color={theme.colors.secondary}
            icon='saveAlt'
            onPress={saveDisplayName}
            size={32}
            isLoading={isChangingName}
          />
        )}
      </View>
    </View>
  )
}

function Form({ user }: { user: User }) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const [isChangingProfilePicture, setIsChangingProfilePicture] = useState(false)

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
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
        paddingTop: insets.top + 16,
        gap: 16,
      }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ gap: 12, marginBottom: 8 }}>
        <View style={{ alignItems: 'center' }}>
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

        <DisplayNameSetter />
      </View>

      <PaneButton
        icon='palette'
        title={t('settings.appearance')}
        onPress={() => router.push('/profile/appearance')}
      />

      <PaneButton
        icon='user'
        title={t('settings.account')}
        onPress={() => router.push('/profile/account')}
      />

      <View style={{ flex: 1, minHeight: 24 }} />

      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceContainer,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View>
          <Image
            source={icon}
            style={{ width: 48, height: 48, position: 'absolute', left: -4, top: -2 }}
            tintColor={theme.colors.primaryContainer}
          />
          <Image source={icon} style={{ width: 48, height: 48 }} tintColor={theme.colors.primary} />
        </View>
        <Text style={{ fontSize: 14, color: theme.colors.onSurface, flexShrink: 1 }}>
          {t('settings.splitMoreMessage')}
        </Text>
      </View>
    </ScrollView>
  )
}

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const theme = useTheme()
  return (
    <ModalScreen
      returnPath='/group/none'
      title={t('screenName.profile.index')}
      maxWidth={500}
      maxHeight={660}
      opaque={false}
    >
      {!user && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
      {user && <Form user={user} />}
    </ModalScreen>
  )
}
