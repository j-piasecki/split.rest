import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { TabView } from '@components/TabView'
import { TextInput } from '@components/TextInput'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useAuth } from '@utils/auth'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { navigateToSplitSpecificFlow } from '@utils/navigateToSplitSpecificFlow'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitTitle } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { CurrencyUtils } from 'shared'

export default function Modal() {
  const user = useAuth()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const threeBarLayout = useThreeBarLayout()
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
  const splitDelayed = getSplitCreationContext().splitMethod === SplitMethod.Delayed

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
    } else if (splitDelayed) {
      if (!user) {
        setError(t('api.mustBeLoggedIn'))
        return
      }

      if (Number.isNaN(Number(total))) {
        setError(t('splitValidation.amountMustBeNumber'))
        return
      }

      if (Number(total) <= 0) {
        setError(t('splitValidation.amountMustBeGreaterThanZero'))
        return
      }

      getSplitCreationContext().totalAmount = total
      getSplitCreationContext().paidById = user?.id ?? null
      getSplitCreationContext().participants = [
        {
          user: {
            ...user,
            displayName: null,
          },
          value: '0.00',
        },
      ]
    }

    getSplitCreationContext().title = title
    getSplitCreationContext().timestamp = timestamp
    navigateToSplitSpecificFlow(Number(id), router)
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
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <Form autofocus onSubmit={submit}>
            <LargeTextInput
              placeholder={t('form.title')}
              value={title}
              onChangeText={(value) => {
                setTitle(value)
                setError(null)
              }}
              icon='receipt'
            />

            {splitDelayed && (
              <LargeTextInput
                placeholder={t('form.totalPaid')}
                value={total}
                onChangeText={(value) => {
                  setTotal(value)
                  setError(null)
                }}
                icon='sell'
                keyboardType='decimal-pad'
              />
            )}

            {/* TODO: this does look kinda out of place */}
            {/* TODO: remember which option was picked last time */}
            {splittingEqually && (
              <TabView
                openedTab={splittingByTotal ? 0 : 1}
                onTabChange={(index) => setSplittingByTotal(index === 0)}
                contentContainerStyle={{
                  padding: threeBarLayout ? 8 : 12,
                }}
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
                        inputStyle={{ fontSize: threeBarLayout ? 14 : 16 }}
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
                        inputStyle={{ fontSize: threeBarLayout ? 14 : 16 }}
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
