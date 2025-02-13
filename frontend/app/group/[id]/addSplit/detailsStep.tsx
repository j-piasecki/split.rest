import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { TabView } from '@components/TabView'
import { TextInput } from '@components/TextInput'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitTitle } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

export default function Modal() {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  const [title, setTitle] = useState(getSplitCreationContext().title ?? '')
  const [timestamp, setTimestamp] = useState(getSplitCreationContext().timestamp ?? Date.now())
  const [error, setError] = useTranslatedError()

  // Fields for equal splits
  const [total, setTotal] = useState(getSplitCreationContext().totalAmount ?? '')
  const [amountPerUser, setAmountPerUser] = useState(getSplitCreationContext().amountPerUser ?? '')
  const [splittingByTotal, setSplittingByTotal] = useState(
    getSplitCreationContext().amountPerUser === null
  )

  const splittingEqually = getSplitCreationContext().splitMethod === SplitMethod.Equal

  function submit() {
    try {
      validateSplitTitle(title)
    } catch (error) {
      setError(error)
      return
    }

    if (splittingEqually) {
      const toValidate = splittingByTotal ? total : amountPerUser

      if (toValidate === '') {
        setError(t('splitValidation.amountRequired'))
        return
      }

      if (Number.isNaN(Number(toValidate))) {
        setError(t('splitValidation.amountMustBeNumber'))
        return
      }

      if (Number(toValidate) <= 0) {
        setError(t('splitValidation.amountMustBeGreaterThanZero'))
        return
      }

      if (splittingByTotal) {
        getSplitCreationContext().totalAmount = total
        getSplitCreationContext().amountPerUser = null
      } else {
        getSplitCreationContext().amountPerUser = amountPerUser
        getSplitCreationContext().totalAmount = null
      }
    }

    getSplitCreationContext().title = title
    getSplitCreationContext().timestamp = timestamp

    switch (getSplitCreationContext().splitMethod) {
      case SplitMethod.ExactAmounts:
        router.navigate(`/group/${id}/addSplit/exactAmounts`)
        break

      case SplitMethod.Equal:
        router.navigate(`/group/${id}/addSplit/participantsStep`)
        break
    }
  }

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitType')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
    >
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            gap: 16,
          }}
        >
          <Pane
            icon='receipt'
            title={t('splitInfo.details')}
            textLocation='start'
            containerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 16 }}
          >
            <Form autofocus onSubmit={submit}>
              <TextInput
                placeholder={t('form.title')}
                value={title}
                onChangeText={(value) => {
                  setTitle(value)
                  setError(null)
                }}
                style={{ marginBottom: 8 }}
              />

              {/* TODO: this does look kinda out of place */}
              {/* TODO: remember which option was picked last time */}
              {splittingEqually && (
                <TabView
                  openedTab={splittingByTotal ? 0 : 1}
                  onTabChange={(index) => setSplittingByTotal(index === 0)}
                  tabs={[
                    {
                      icon: 'sell',
                      title: t('form.byTotal'),
                      content: (
                        <TextInput
                          placeholder={t('form.totalPaid')}
                          keyboardType='decimal-pad'
                          value={total}
                          onChangeText={(value) => {
                            setTotal(value.replace(',', '.'))
                            setError(null)
                          }}
                          style={{ marginBottom: 8 }}
                          onBlur={() => {
                            const amountNum = Number(total)
                            if (!Number.isNaN(amountNum) && total.length > 0) {
                              setTotal(CurrencyUtils.format(amountNum))
                            }
                          }}
                        />
                      ),
                    },
                    {
                      icon: 'user',
                      title: t('form.perPerson'),
                      content: (
                        <TextInput
                          placeholder={t('form.amountPerPerson')}
                          keyboardType='decimal-pad'
                          value={amountPerUser}
                          onChangeText={(value) => {
                            setAmountPerUser(value.replace(',', '.'))
                            setError(null)
                          }}
                          style={{ marginBottom: 8 }}
                          onBlur={() => {
                            const amountNum = Number(amountPerUser)
                            if (!Number.isNaN(amountNum) && total.length > 0) {
                              setAmountPerUser(CurrencyUtils.format(amountNum))
                            }
                          }}
                        />
                      ),
                    },
                  ]}
                />
              )}
            </Form>
          </Pane>

          <CalendarPane
            initialDate={timestamp}
            onDateChange={setTimestamp}
            showDateOnHeader
            startCollapsed
          />
        </ScrollView>

        <View style={{ gap: 16 }}>
          {error && <ErrorText>{error}</ErrorText>}
          <Button rightIcon='chevronForward' title={t('form.buttonNext')} onPress={submit} />
        </View>
      </View>
    </ModalScreen>
  )
}
