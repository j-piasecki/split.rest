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
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useInviteUserToGroupMutation } from '@hooks/database/useInviteUserToGroup'
import { useSetInviteWithdrawnMutation } from '@hooks/database/useInviteWithdrawnMutation'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
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
      setError(new TranslatableError('inviteMember.emailIsTooLong'))
      return
    }

    setWaiting(true)
    setUser(null)

    getUserByEmail(email)
      .then((user) => {
        if (user === null) {
          setError(new TranslatableError('inviteMember.userNotFound'))
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

function UserPane({
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
    <Pane
      headerHidden
      containerStyle={{
        height: 224,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View>
        {error && <ErrorText>{error}</ErrorText>}

        {waiting && <ActivityIndicator color={theme.colors.onSurface} />}

        {user && (
          <View style={{ flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <ProfilePicture userId={user.id} size={128} />
            <Text
              style={{
                color: theme.colors.onSurface,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {user.name}
            </Text>
          </View>
        )}
      </View>
    </Pane>
  )
}

function UserPicker() {
  const router = useRouter()
  const snack = useSnack()
  const insets = useModalScreenInsets()
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()

  const { data: permissions } = useGroupPermissions(Number(groupId))
  const [email, setEmail] = useState('')
  const [user, waiting, error] = useUserByEmail(email)
  const [addingError, setAddingError] = useTranslatedError()
  const { mutateAsync: inviteUserToGroup, isPending: isAddingToGroup } =
    useInviteUserToGroupMutation(Number(groupId))
  const { mutateAsync: setInviteWithdrawn } = useSetInviteWithdrawnMutation(Number(groupId), true)

  function handlePress() {
    if (user === null) {
      setAddingError(new TranslatableError('inviteMember.userNotFound'))
      return
    }

    inviteUserToGroup(user.id)
      .then(() => {
        if (permissions?.canManageDirectInvites()) {
          snack.show({
            message: t('inviteMember.inviteSent', { name: user.name }),
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
          snack.show({ message: t('inviteMember.inviteSent', { name: user.name }) })
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
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        gap: 24,
        justifyContent: 'space-between',
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
        paddingTop: insets.top + 16,
      }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ gap: 16 }}>
        <Pane
          icon='user'
          title={t('inviteMember.findByEmail')}
          textLocation='start'
          containerStyle={{ padding: 16, gap: 32 }}
        >
          <Form onSubmit={handlePress} autofocus>
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
            />
          </Form>
        </Pane>

        <UserPane user={user} waiting={waiting} error={error} />
      </View>

      <View style={{ gap: 8 }}>
        {addingError && <ErrorText>{addingError}</ErrorText>}
        <Button
          leftIcon='addMember'
          title={t('inviteMember.inviteMember')}
          onPress={handlePress}
          isLoading={isAddingToGroup}
          disabled={isAddingToGroup || waiting || user === null}
        />
      </View>
    </ScrollView>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.inviteMember')}
      maxWidth={400}
      maxHeight={600}
    >
      <UserPicker />
    </ModalScreen>
  )
}
