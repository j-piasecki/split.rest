import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { TextInput } from '@components/TextInput'
import { useCreateGroup } from '@hooks/database/useCreateGroup'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

function CreateGroupForm() {
  const router = useRouter()
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
        router.replace(`/group/${group.id}`)
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
      <Pane
        icon='group'
        title={t('group.details')}
        textLocation='start'
        containerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, gap: 16 }}
      >
        <Form autofocus onSubmit={handlePress}>
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
          {/* TODO: use actual picker instead of disabled textinput */}
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
        </Form>
      </Pane>

      <View style={{ gap: 16 }}>
        {error && <ErrorText>{error}</ErrorText>}
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
      <CreateGroupForm />
    </ModalScreen>
  )
}
