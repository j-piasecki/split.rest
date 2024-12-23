import { Button } from '@components/Button'
import { Pane } from '@components/Pane'
import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useCreateGroup } from '@hooks/database/useCreateGroup'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

function Form() {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('PLN')
  const [error, setError] = useTranslatedError()
  const { mutateAsync: createGroup, isPending } = useCreateGroup()

  function handlePress() {
    setError(null)

    if (name === '') {
      setError(t('groupValidation.nameCannotBeEmpty'))
      return
    }

    if (name.length > 128) {
      setError(t('groupValidation.nameIsTooLong'))
      return
    }

    createGroup({ name, currency })
      .then((group) => {
        router.navigate(`/group/${group.id}`, { withAnchor: true })
      })
      .catch((error) => {
        setError(error)
      })
  }

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
      }}
    >
      <Pane icon='group' title={t('group.details')} textLocation='start' containerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, gap: 16 }}>
        <TextInput
          placeholder='Name'
          value={name}
          onChangeText={(text) => {
            setName(text)
            setError(null)
          }}
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
      </Pane>

      <View style={{ gap: 16 }}>
        {error && <Text style={{
          color: theme.colors.error,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 500,
        }}>{error}</Text>}
        <Button title='Create' leftIcon='check' onPress={handlePress} isLoading={isPending} />
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()

  return (
    <ModalScreen
      returnPath='/home'
      title={t('screenName.createGroup')}
      maxWidth={450}
      maxHeight={500}
    >
      <Form />
    </ModalScreen>
  )
}
