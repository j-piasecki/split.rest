import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { Picker } from '@components/Picker'
import { TextInput } from '@components/TextInput'
import { useCreateGroup } from '@hooks/database/useCreateGroup'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { getLocales } from 'expo-localization'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

const CURRENCIES = ['eur', 'gbp', 'pln', 'usd'] as const

function getDefaultCurrency() {
  const locale = getLocales()[0]
  const currency = locale.currencySymbol?.toLocaleLowerCase() ?? 'usd'

  if (!CURRENCIES.some((item) => item === currency)) {
    return 'usd'
  }

  return currency
}

function CreateGroupForm() {
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState(getDefaultCurrency())
  const [error, setError] = useTranslatedError()
  const { mutateAsync: createGroup, isPending } = useCreateGroup()

  const currencyPickerItems = CURRENCIES.map((currency) => ({
    value: currency,
    label: t(`currency.${currency}`),
  }))

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
            placeholder={t('createGroup.name')}
            value={name}
            onChangeText={(text) => {
              setName(text)
              setError(null)
            }}
            style={{
              width: '100%',
            }}
          />
          <Picker
            hint={t('createGroup.currency')}
            items={currencyPickerItems}
            selectedItem={currency}
            onSelectionChange={setCurrency}
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
