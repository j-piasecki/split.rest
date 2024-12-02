import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { TextInput } from '@components/TextInput'
import { createGroup } from '@database/createGroup'
import { useTheme } from '@styling/theme'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

function Form() {
  const router = useRouter()
  const theme = useTheme()
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

    if (name.length > 128) {
      setError('Name is too long')
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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        gap: 16,
        paddingBottom: 32,
        paddingHorizontal: 48,
      }}
    >
      <TextInput
        placeholder='Name'
        value={name}
        onChangeText={setName}
        style={{
          width: '100%',
        }}
      />
      <TextInput
        placeholder='Currency'
        value={currency}
        onChangeText={setCurrency}
        editable={false}
        focusable={false}
        style={{
          width: '100%',
          opacity: 0.5,
        }}
      />

      {!waiting && <Button title='Create' onPress={handlePress} />}
      {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}

      {error.length > 0 && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  )
}

export default function Modal() {
  return (
    <ModalScreen returnPath='/home' title='Create Group' maxWidth={500} maxHeight={300}>
      <Form />
    </ModalScreen>
  )
}
