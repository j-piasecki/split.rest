import ModalScreen from '@components/ModalScreen'
import { addUserToGroup } from '@database/addUsersToGroup'
import { findUserIdByEmail } from '@database/findUserByEmail'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native'

function Form() {
  const router = useRouter()
  const { id: groupId } = useLocalSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)

  function handlePress() {
    setWaiting(true)
    setError('')

    if (email === '') {
      setError('E-mail cannot be empty')
      setWaiting(false)
      return
    }

    findUserIdByEmail(email)
      .then((id) => {
        addUserToGroup(groupId as string, id)
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder='E-mail'
        value={email}
        onChangeText={setEmail}
        style={{ padding: 8, borderWidth: 1, borderColor: 'black', margin: 4, borderRadius: 8 }}
      />
      {!waiting && <Button title='Add user' onPress={handlePress} />}
      {waiting && <ActivityIndicator size='small' />}

      {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()

  return (
    <ModalScreen returnPath={`/${id}`} title='Add user'>
      <Form />
    </ModalScreen>
  )
}
