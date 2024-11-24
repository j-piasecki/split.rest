import ModalScreen from '@components/ModalScreen'
import { createGroup } from '@database/createGroup'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native'

function Form() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('PLN')
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)

  function handlePress() {
    setWaiting(true)
    setError('')

    if (name === '') {
      setError('Name cannot be empty')
      setWaiting(false)
      return
    }

    createGroup(name, currency)
      .then((group) => {
        router.navigate('/' + group.id, { withAnchor: true })
        setWaiting(false)
      })
      .catch((error) => {
        setError(error.message)
        setWaiting(false)
      })
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 32, paddingHorizontal: 48 }}>
      <TextInput
        placeholder='Name'
        value={name}
        onChangeText={setName}
        style={{ width: '100%', maxWidth: 300, padding: 8, borderWidth: 1, borderColor: 'black', margin: 4, borderRadius: 8 }}
      />
      <TextInput
        placeholder='Currency'
        value={currency}
        onChangeText={setCurrency}
        editable={false}
        style={{
          width: '100%',
          maxWidth: 300,
          padding: 8,
          borderWidth: 1,
          borderColor: 'black',
          margin: 4,
          borderRadius: 8,
          opacity: 0.5,
        }}
      />

      {!waiting && <Button title='Create' onPress={handlePress} />}
      {waiting && <ActivityIndicator size='small' />}

      {error.length > 0 && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  )
}

export default function Modal() {
  return (
    <ModalScreen returnPath='/home' title='Create Group' maxWidth={600} maxHeight={300}>
      <Form />
    </ModalScreen>
  )
}
