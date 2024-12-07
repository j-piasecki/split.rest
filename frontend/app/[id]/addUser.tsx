import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { TextInput } from '@components/TextInput'
import { getUserByEmail } from '@database/getUserByEmail'
import { useAddUserToGroupMutation } from '@hooks/database/useAddUserToGroup'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

function Form() {
  const router = useRouter()
  const theme = useTheme()
  const { id: groupId } = useLocalSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)
  const { mutateAsync: addUserToGroup } = useAddUserToGroupMutation(Number(groupId))

  function handlePress() {
    setWaiting(true)
    setError('')

    if (email === '') {
      setError('E-mail cannot be empty')
      setWaiting(false)
      return
    }

    if (email.length > 512) {
      setError('E-mail is too long')
      setWaiting(false)
      return
    }

    getUserByEmail(email)
      .then((user) => {
        if (user === null) {
          setError('User not found')
          setWaiting(false)
          return
        }

        addUserToGroup(user.id)
          .then(() => {
            setWaiting(false)

            if (router.canGoBack()) {
              router.back()
            } else {
              router.navigate(`/${groupId}`)
            }
          })
          .catch((error) => {
            setError(error.message)
            setWaiting(false)
          })
      })
      .catch((error) => {
        setError(error.message)
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
      <TextInput placeholder='E-mail' value={email} onChangeText={setEmail} />
      {!waiting && <Button title='Add user' onPress={handlePress} />}
      {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}

      {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()

  return (
    <ModalScreen returnPath={`/${id}`} title='Add user' maxWidth={400} maxHeight={250}>
      <Form />
    </ModalScreen>
  )
}
