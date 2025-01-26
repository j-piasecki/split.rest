import { FormActionType, FormData } from './formData'
import { Pane } from '@components/Pane'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import React, { useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export interface DetailsPaneProps {
  groupInfo: GroupUserInfo
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  titleEditable?: boolean
  showPaidByHint?: boolean
}

export function DetailsPane({
  groupInfo,
  formState,
  updateForm,
  titleEditable = true,
  showPaidByHint = true,
}: DetailsPaneProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const toBePaid = useRef(0)
  const sumFromEntries = formState.entries.reduce((acc, entry) => acc + Number(entry.amount), 0)
  if (!Number.isNaN(sumFromEntries)) {
    // eslint-disable-next-line react-compiler/react-compiler
    toBePaid.current = sumFromEntries
  }
  const paidBy = formState.entries[formState.paidByIndex]

  // Show email if there are multiple users with the same name, otherwise show the name
  const payerName = paidBy.user
    ? formState.entries.filter((entry) => entry.user?.name === paidBy.user?.name).length > 1
      ? paidBy.user.email
      : paidBy.user.name
    : paidBy.entry

  return (
    <Pane
      icon='receipt'
      title={t('splitInfo.details')}
      textLocation='start'
      containerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 16 }}
    >
      {titleEditable && (
        <TextInput
          placeholder={t('form.title')}
          value={formState.title}
          onChangeText={(value) => updateForm({ type: 'setTitle', title: value })}
          style={{ marginBottom: 8 }}
        />
      )}

      {!titleEditable && (
        <Text style={{ color: theme.colors.onSurface, fontSize: 24, fontWeight: 500 }}>
          {formState.title}
        </Text>
      )}

      {showPaidByHint && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 4,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: theme.colors.outline,
              fontSize: 20,
              opacity: 0.7,
            }}
          >
            <Trans
              i18nKey='splitInfo.hasPaidText'
              values={{
                payer: payerName,
                // eslint-disable-next-line react-compiler/react-compiler
                amount: CurrencyUtils.format(toBePaid.current, groupInfo.currency),
              }}
              components={{ Styled: <Text style={{ color: theme.colors.primary }} /> }}
            />
          </Text>
        </View>
      )}
    </Pane>
  )
}
