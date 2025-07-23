import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { Picker } from '@components/Picker'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { TextInput } from '@components/TextInput'
import { useCreateGroup } from '@hooks/database/useCreateGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { AllSplitMethods } from '@utils/splitCreationContext'
import { getLocales } from 'expo-localization'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { CurrencyUtils, SplitMethod, validateAllowedSplitMethods } from 'shared'

function getDefaultCurrency() {
  const locale = getLocales()[0]
  const currency = locale.currencySymbol?.toLocaleLowerCase() ?? 'usd'

  if (!CurrencyUtils.supportedCurrencies.some((item) => item === currency)) {
    return 'usd'
  }

  return currency
}

function CreateGroupForm() {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState(getDefaultCurrency())
  const [allowedSplitMethods, setAllowedSplitMethods] = useState<SplitMethod[]>(AllSplitMethods)
  const [collapsed, setCollapsed] = useState(true)
  const [error, setError] = useTranslatedError()
  const { mutateAsync: createGroup, isPending } = useCreateGroup()

  const currencyPickerItems = CurrencyUtils.supportedCurrencies.map((currency) => ({
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

    const error = validateAllowedSplitMethods(allowedSplitMethods)
    if (error) {
      setError(t(error))
      return
    }

    createGroup({ name, currency, allowedSplitMethods })
      .then((group) => {
        router.replace(`/group/${group.id}`)
      })
      .catch((error) => {
        setError(error)
      })
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          flexGrow: 1,
          gap: 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingBottom: 16,
          paddingTop: insets.top + 16,
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

        <Pane
          icon='split'
          title={t('group.allowedSplitMethods')}
          textLocation='start'
          collapsible
          collapsed={collapsed}
          onCollapseChange={setCollapsed}
        >
          {!collapsed && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12, gap: 16 }}>
              <SplitMethodSelector
                multiple
                startExpanded={false}
                displayedMethods={AllSplitMethods}
                allowedMethods={AllSplitMethods}
                selectedMethods={allowedSplitMethods}
                onSelectionChange={setAllowedSplitMethods}
              />
            </View>
          )}
        </Pane>
      </ScrollView>

      <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12, gap: 8 }}>
        {error && (
          <View style={{ marginTop: 8 }}>
            <ErrorText>{error}</ErrorText>
          </View>
        )}
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
      maxWidth={500}
      maxHeight={600}
    >
      <CreateGroupForm />
    </ModalScreen>
  )
}
