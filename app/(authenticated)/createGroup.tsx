import { createGroup } from '@database/createGroup'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

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
        router.navigate('/group/' + group.id, { withAnchor: true })
        setWaiting(false)
      })
      .catch((error) => {
        setError(error.message)
        setWaiting(false)
      })
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder='Name'
        value={name}
        onChangeText={setName}
        style={{ padding: 8, borderWidth: 1, borderColor: 'black', margin: 4, borderRadius: 8 }}
      />
      <TextInput
        placeholder='Currency'
        value={currency}
        onChangeText={setCurrency}
        editable={false}
        style={{
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
  const router = useRouter()

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
      }}
    >
      {/* Dismiss modal when pressing outside */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          router.canGoBack() ? router.back() : router.navigate('/home')
        }}
      />
      <Animated.View
        style={{
          width: '90%',
          height: '80%',
          maxWidth: 768,
          maxHeight: 600,
          backgroundColor: 'white',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20 }}>Create Group</Text>
          <Button
            title='Close'
            onPress={() => {
              router.canGoBack() ? router.back() : router.navigate('/home')
            }}
          />
        </View>
        <Form />
      </Animated.View>
    </Animated.View>
  )
}
