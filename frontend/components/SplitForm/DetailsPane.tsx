import { FormActionType, FormData, SplitEntryData } from './formData'
import { LargeTextInput } from '@components/LargeTextInput'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { CurrencyUtils, SplitMethod } from 'shared'
import { GroupUserInfo } from 'shared'

export interface DetailsPaneProps {
  groupInfo: GroupUserInfo
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  splitMethod: SplitMethod
  titleEditable?: boolean
  showPaidByHint?: boolean
  showTotal?: boolean
  isBorrowSplit?: boolean
}

export function DetailsPane({
  groupInfo,
  formState,
  updateForm,
  splitMethod,
  titleEditable = true,
  showPaidByHint = true,
  showTotal = true,
  isBorrowSplit = false,
}: DetailsPaneProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const toBePaid = useRef(0)
  const sumFromEntries = formState.entries.reduce((acc, entry) => acc + Number(entry.amount), 0)
  if (!Number.isNaN(sumFromEntries)) {
    // eslint-disable-next-line react-compiler/react-compiler
    toBePaid.current = sumFromEntries
  }
  const paidBy: SplitEntryData | undefined = formState.entries[formState.paidByIndex]

  // Show email if there are multiple users with the same name, otherwise show the name
  const payerName = paidBy
    ? paidBy.user
      ? formState.entries.filter((entry) => entry.user?.name === paidBy.user?.name).length > 1
        ? paidBy.user.email
        : paidBy.user.name
      : paidBy.entry
    : t('form.unknownPayer')

  return (
    <View>
      {showPaidByHint && (
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 18,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          <Trans
            i18nKey={
              splitMethod === SplitMethod.Lend
                ? isBorrowSplit
                  ? 'splitInfo.borrowedFrom'
                  : 'splitInfo.lentBy'
                : 'splitInfo.paidBy'
            }
            values={{ payer: payerName }}
            components={{
              Styled: <Text style={{ color: theme.colors.tertiary, fontWeight: 600 }} />,
            }}
          />
        </Text>
      )}

      {showTotal && (
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 56,
            fontWeight: 700,
            textAlign: 'center',
            transform: [{ translateY: -4 }],
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {/* eslint-disable-next-line react-compiler/react-compiler */}
          {CurrencyUtils.format(toBePaid.current, groupInfo.currency)}
        </Text>
      )}

      {titleEditable && (
        <LargeTextInput
          placeholder={t('form.title')}
          value={formState.title}
          onChangeText={(value) => updateForm({ type: 'setTitle', title: value })}
          icon='receipt'
        />
      )}

      {!titleEditable && formState.title !== '' && (
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: 600,
            textAlign: 'center',
            transform: [{ translateY: -4 }],
          }}
        >
          {formState.title}
        </Text>
      )}
    </View>
  )
}
