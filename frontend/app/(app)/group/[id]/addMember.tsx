import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { getUserByEmail } from '@database/getUserByEmail'
import { useCreateGhostMutation } from '@hooks/database/useCreateGhostMutation'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useInviteUserToGroupMutation } from '@hooks/database/useInviteUserToGroup'
import { useSetInviteWithdrawnMutation } from '@hooks/database/useInviteWithdrawnMutation'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { TranslatableError, User } from 'shared'
import { useDebounce } from 'use-debounce'

function useUserByEmail(email: string): [User | null, boolean, string | null] {
  const [debouncedEmail] = useDebounce(email, 500)
  const [user, setUser] = useState<User | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useTranslatedError()

  useEffect(() => {
    setError('')

    if (debouncedEmail === '' || debouncedEmail.indexOf('@') === -1) {
      return
    }

    if (debouncedEmail.length > 512) {
      setError(new TranslatableError('addMember.emailIsTooLong'))
      return
    }

    setWaiting(true)
    setUser(null)

    getUserByEmail(debouncedEmail)
      .then((user) => {
        if (user === null) {
          setError(new TranslatableError('addMember.userNotFound'))
          return
        }

        setUser(user)
      })
      .finally(() => {
        setWaiting(false)
      })
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEmail])

  return [user, waiting, error]
}

function UserPreview({
  user,
  waiting,
  error,
}: {
  user: User | null
  waiting: boolean
  error: string | null
}) {
  const theme = useTheme()

  if (!error && !waiting && !user) {
    return null
  }

  return (
    <View
      style={{ backgroundColor: theme.colors.surfaceContainerHigh, padding: 8, borderRadius: 16 }}
    >
      {error && <ErrorText>{error}</ErrorText>}

      {waiting && <ActivityIndicator color={theme.colors.onSurface} />}

      {user && (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
          <ProfilePicture user={user} size={96} />
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={{
              flexShrink: 1,
              color: theme.colors.onSurface,
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {user.name}
          </Text>
        </View>
      )}
    </View>
  )
}

function AddByEmailPane({ onFocus }: { onFocus?: () => void }) {
  const router = useRouter()
  const snack = useSnack()
  const theme = useTheme()
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(groupId))

  const [email, setEmail] = useState('')
  const [user, waiting, error] = useUserByEmail(email)
  const [addingError, setAddingError] = useTranslatedError()
  const { mutateAsync: inviteUserToGroup, isPending: isAddingToGroup } =
    useInviteUserToGroupMutation(Number(groupId))
  const { mutateAsync: setInviteWithdrawn } = useSetInviteWithdrawnMutation(Number(groupId), true)

  function handlePress() {
    if (user === null) {
      setAddingError(new TranslatableError('addMember.userNotFound'))
      return
    }

    inviteUserToGroup(user.id)
      .then(() => {
        if (groupInfo?.permissions?.canManageDirectInvites?.()) {
          snack.show({
            message: t('addMember.inviteSent', { name: user.name }),
            actionText: t('undo'),
            action: async () => {
              try {
                await setInviteWithdrawn({ withdrawn: true, userId: user.id })
              } catch (error) {
                if (error instanceof TranslatableError) {
                  alert(t(error.message, error.args))
                } else {
                  alert(t('unknownError'))
                }
              }
            },
          })
        } else {
          snack.show({ message: t('addMember.inviteSent', { name: user.name }) })
        }

        if (router.canGoBack()) {
          router.back()
        } else {
          router.navigate(`/group/${groupId}`)
        }
      })
      .catch((error) => {
        setAddingError(error)
      })
  }

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
        {t('addMember.addByEmailDescription')}
      </Text>
      <View style={{ gap: 16 }}>
        <Form onSubmit={handlePress}>
          <TextInput
            placeholder={t('email')}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setAddingError('')
            }}
            editable={!isAddingToGroup}
            onFocus={onFocus}
          />
        </Form>

        <UserPreview user={user} waiting={waiting} error={error} />
      </View>

      <View style={{ gap: 8 }}>
        {addingError && <ErrorText>{addingError}</ErrorText>}
        <Button
          leftIcon='addMember'
          title={t('addMember.inviteMember')}
          onPress={handlePress}
          isLoading={isAddingToGroup}
          disabled={isAddingToGroup || waiting || user === null}
        />
      </View>
    </View>
  )
}

export function AddByNamePane({ onFocus }: { onFocus?: () => void }) {
  const router = useRouter()
  const snack = useSnack()
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()
  const theme = useTheme()

  const [name, setName] = useState('')
  const [addingError, setAddingError] = useTranslatedError()
  const { mutateAsync: createGhost, isPending: isCreating } = useCreateGhostMutation(
    Number(groupId)
  )

  function handlePress() {
    const nameToUse = name.trim()

    if (nameToUse === '') {
      setAddingError(new TranslatableError('api.user.nameCannotBeEmpty'))
      return
    }

    if (nameToUse.length > 128) {
      setAddingError(new TranslatableError('api.user.nameTooLong'))
      return
    }

    createGhost(nameToUse)
      .then(() => {
        snack.show({ message: t('addMember.addByNameSuccess', { name: nameToUse }) })
        if (router.canGoBack()) {
          router.back()
        } else {
          router.navigate(`/group/${groupId}`)
        }
      })
      .catch((error) => {
        setAddingError(error)
      })
  }

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
          {t('addMember.addByNameDescription')}
        </Text>
        <Form onSubmit={handlePress}>
          <TextInput
            placeholder={t('addMember.name')}
            value={name}
            onChangeText={(text) => {
              setName(text)
              setAddingError('')
            }}
            editable={!isCreating}
            onFocus={onFocus}
          />
        </Form>
      </View>

      <View style={{ gap: 8 }}>
        {addingError && <ErrorText>{addingError}</ErrorText>}
        <Button
          leftIcon='addMember'
          title={t('addMember.addMember')}
          onPress={handlePress}
          isLoading={isCreating}
          disabled={isCreating || name.trim() === ''}
        />
      </View>
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const insets = useModalScreenInsets()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const scrollViewRef = useRef<ScrollView>(null)

  const canInviteByEmail = groupInfo?.permissions?.canInviteMembers?.() ?? false
  const canCreateGhosts = groupInfo?.permissions?.canCreateGhosts?.() ?? false

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.addMember')}
      maxWidth={500}
      maxHeight={650}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          paddingBottom: insets.bottom + 16,
          paddingTop: insets.top + 16,
          gap: 16,
        }}
        keyboardShouldPersistTaps='handled'
      >
        {canInviteByEmail && (
          <Pane
            title={t('addMember.findByEmail')}
            icon='stackedEmail'
            collapsible
            textLocation='start'
          >
            <AddByEmailPane
              onFocus={() =>
                setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 150)
              }
            />
          </Pane>
        )}
        {canCreateGhosts && (
          <Pane
            title={t('addMember.addWithoutAccount')}
            icon='user'
            collapsible
            textLocation='start'
          >
            <AddByNamePane
              onFocus={() =>
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150)
              }
            />
          </Pane>
        )}
      </ScrollView>
    </ModalScreen>
  )
}
