import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { TabView } from '@components/TabView'
import { TextInput } from '@components/TextInput'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useAuth } from '@utils/auth'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { navigateToSplitSpecificFlow } from '@utils/navigateToSplitSpecificFlow'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitTitle } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import {
  CurrencyUtils,
  DEFAULT_BALANCE_WHEN_NOT_SET,
  DEFAULT_DISPLAY_NAME_WHEN_NOT_SET,
  DEFAULT_HAS_ACCESS_WHEN_NOT_SET,
  DEFAULT_IS_ADMIN_WHEN_NOT_SET,
  SplitMethod,
} from 'shared'

export default function Modal() {
  const { user } = useAuth()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))

  const [title, setTitle] = useState(SplitCreationContext.current.title ?? '')
  const [timestamp, setTimestamp] = useState(SplitCreationContext.current.timestamp ?? Date.now())
  const [error, setError] = useTranslatedError()

  // Fields for equal splits
  const [total, setTotal] = useState(SplitCreationContext.current.totalAmount ?? '')
  const [amountPerUser, setAmountPerUser] = useState(
    SplitCreationContext.current.amountPerUser ?? ''
  )
  const [splittingByTotal, setSplittingByTotal] = useState(
    SplitCreationContext.current.amountPerUser === null
  )

  const splitEqually = SplitCreationContext.current.splitMethod === SplitMethod.Equal
  const splitDelayed = SplitCreationContext.current.splitMethod === SplitMethod.Delayed
  const splitByShares = SplitCreationContext.current.splitMethod === SplitMethod.Shares

  function submit() {
    try {
      validateSplitTitle(title)
    } catch (error) {
      setError(error)
      return
    }

    if (splitEqually) {
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
        SplitCreationContext.current.setTotalAmount(total)
        SplitCreationContext.current.setAmountPerUser(null)
      } else {
        SplitCreationContext.current.setAmountPerUser(amountPerUser)
        SplitCreationContext.current.setTotalAmount(null)
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

      SplitCreationContext.current.setTotalAmount(total)
      SplitCreationContext.current.setPaidById(user?.id ?? null)
      SplitCreationContext.current.setParticipants([
        {
          user: {
            ...user,
            balance: groupInfo?.balance ?? DEFAULT_BALANCE_WHEN_NOT_SET,
            isAdmin: groupInfo?.isAdmin ?? DEFAULT_IS_ADMIN_WHEN_NOT_SET,
            hasAccess: groupInfo?.hasAccess ?? DEFAULT_HAS_ACCESS_WHEN_NOT_SET,
            displayName: DEFAULT_DISPLAY_NAME_WHEN_NOT_SET,
          },
          value: '0.00',
        },
      ])
    } else if (splitByShares) {
      if (Number.isNaN(Number(total))) {
        setError(t('splitValidation.amountMustBeNumber'))
        return
      }

      if (Number(total) <= 0) {
        setError(t('splitValidation.amountMustBeGreaterThanZero'))
        return
      }

      SplitCreationContext.current.setTotalAmount(total)
    }

    SplitCreationContext.current.setTitle(title)
    SplitCreationContext.current.setTimestamp(timestamp)
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

            {(splitDelayed || splitByShares) && (
              <LargeTextInput
                placeholder={t('form.totalPaid')}
                value={total}
                onChangeText={(value) => {
                  setTotal(value)
                  setError(null)
                }}
                icon='sell'
                keyboardType='decimal-pad'
                onBlur={() => {
                  const amountNum = Number(total)
                  if (!Number.isNaN(amountNum) && total.length > 0) {
                    setTotal(CurrencyUtils.format(amountNum))
                  }
                }}
              />
            )}

            {/* TODO: this does look kinda out of place */}
            {/* TODO: remember which option was picked last time */}
            {splitEqually && (
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
