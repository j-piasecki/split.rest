import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { getUserByEmail } from '@database/getUserByEmail'
import { useAddUserToGroupMutation } from '@hooks/database/useAddUserToGroup'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { TranslatableError } from 'shared'

function Form() {
  const router = useRouter()
  const theme = useTheme()
  const { id: groupId } = useLocalSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)
  const { mutateAsync: addUserToGroup } = useAddUserToGroupMutation(Number(groupId))
  const { t } = useTranslation()

  function handlePress() {
    setWaiting(true)
    setError('')

    if (email === '') {
      setError(new TranslatableError('addUser.emailCannotBeEmpty'))
      setWaiting(false)
      return
    }

    if (email.length > 512) {
      setError(new TranslatableError('addUser.emailIsTooLong'))
      setWaiting(false)
      return
    }

    getUserByEmail(email)
      .then((user) => {
        if (user === null) {
          setError(new TranslatableError('addUser.userNotFound'))
          setWaiting(false)
          return
        }

        addUserToGroup(user.id)
          .then(() => {
            setWaiting(false)

            if (router.canGoBack()) {
              router.back()
            } else {
              router.navigate(`/group/${groupId}`)
            }
          })
          .catch((error) => {
            setError(error)
            setWaiting(false)
          })
      })
      .catch((error) => {
        setError(error)
        setWaiting(false)
      })
  }

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        justifyContent: 'center',
        paddingBottom: 32,
        paddingHorizontal: 48,
      }}
    >
      <TextInput
        placeholder={t('email')}
        keyboardType='email-address'
        autoCapitalize='none'
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      {!waiting && (
        <Button leftIcon='addMember' title={t('addUser.addUser')} onPress={handlePress} />
      )}
      {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}

      {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.addUser')}
      maxWidth={400}
      maxHeight={250}
    >
      <Form />
    </ModalScreen>
  )
}
