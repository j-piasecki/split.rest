import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitTitle } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function Modal() {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  const [title, setTitle] = useState(getSplitCreationContext().title ?? '')
  const [total, setTotal] = useState(getSplitCreationContext().totalAmount ?? '')
  const [error, setError] = useTranslatedError()

  const totalVisible = getSplitCreationContext().splitType === SplitMethod.Equal

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitType')}
      maxWidth={500}
      opaque={false}
    >
      <View
        style={{ flex: 1, paddingTop: 8, paddingHorizontal: 16, justifyContent: 'space-between' }}
      >
        <Pane
          icon='receipt'
          title={t('splitInfo.details')}
          textLocation='start'
          containerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 16 }}
        >
          <TextInput
            placeholder={t('form.title')}
            value={title}
            onChangeText={(value) => {
              setTitle(value)
              setError(null)
            }}
            style={{ marginBottom: 8 }}
          />

          {totalVisible && (
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
                  setTotal(amountNum.toFixed(2))
                }
              }}
            />
          )}
        </Pane>

        <View style={{ gap: 16 }}>
          {error && (
            <Text
              style={{
                color: theme.colors.error,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {error}
            </Text>
          )}
          <Button
            rightIcon='chevronForward'
            title={t('splitType.buttonNext')}
            onPress={() => {
              try {
                validateSplitTitle(title)
              } catch (error) {
                setError(error)
                return
              }

              if (totalVisible) {
                if (total === '') {
                  setError(t('splitValidation.totalRequired'))
                  return
                }

                if (Number.isNaN(Number(total))) {
                  setError(t('splitValidation.totalAmountMustBeNumber'))
                  return
                }

                if (Number(total) <= 0) {
                  setError(t('splitValidation.totalMustBeGreaterThanZero'))
                  return
                }

                getSplitCreationContext().totalAmount = total
              }

              getSplitCreationContext().title = title

              switch (getSplitCreationContext().splitType) {
                case SplitMethod.ExactAmounts:
                  router.navigate(`/group/${id}/addSplit/exactAmounts`)
                  break

                case SplitMethod.Equal:
                  router.navigate(`/group/${id}/addSplit/participantsStep`)
                  break
              }
            }}
          />
        </View>
      </View>
    </ModalScreen>
  )
}
