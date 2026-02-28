import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { SuggestionsPane } from './SuggestionsPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { IconName } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import { useAuth } from '@utils/auth'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { GroupUserInfo, LanguageTranslationKey, Member, SplitMethod } from 'shared'

export interface SplitFormProps {
  groupInfo: GroupUserInfo
  splitMethod: SplitMethod
  initialTitle?: string | null
  initialEntries: SplitEntryData[]
  initialPaidByIndex?: number
  initialTimestamp?: number
  initialTotal?: string
  waiting?: boolean
  cleanError: () => void
  onSubmit: (data: FormData) => void
  error?: string | null
  showDetails?: boolean
  showCalendar?: boolean
  showSuggestions?: boolean
  buttonIcon?: IconName
  buttonTitle?: LanguageTranslationKey
  buttonIconLocation?: 'left' | 'right'
  style?: StyleProp<ViewStyle>
  showAddAllMembers?: boolean
  showPayerSelector?: boolean
}

export function SplitForm({
  groupInfo,
  splitMethod,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  initialTimestamp,
  initialTotal,
  waiting,
  onSubmit,
  error,
  cleanError,
  showDetails = true,
  showCalendar = true,
  showSuggestions = true,
  buttonIcon = 'save',
  buttonTitle = 'form.save',
  buttonIconLocation = 'left',
  showAddAllMembers = true,
  showPayerSelector = true,
  style,
}: SplitFormProps) {
  const user = useAuth()
  const scrollRef = useRef<ScrollView>(null)
  const { t } = useTranslation()
  const [fetchingMembers, setFetchingMembers] = useState(false)
  const [total, setTotal] = useState(initialTotal ?? '')
  const [formState, updateForm] = useFormData(
    {
      title: initialTitle ?? '',
      timestamp: initialTimestamp ?? Date.now(),
      paidByIndex: initialPaidByIndex ?? 0,
      entries: initialEntries,
    },
    cleanError
  )

  const showPaidByHint = splitMethod !== SplitMethod.BalanceChanges
  const showPayerEntry = splitMethod !== SplitMethod.Lend
  const showEntries = splitMethod !== SplitMethod.Delayed
  const showTotalInput = splitMethod === SplitMethod.Delayed
  const balanceKeyboardType =
    splitMethod === SplitMethod.BalanceChanges
      ? Platform.OS === 'android'
        ? 'phone-pad'
        : 'numbers-and-punctuation'
      : splitMethod === SplitMethod.Shares
        ? 'number-pad'
        : undefined
  const integersOnly = splitMethod === SplitMethod.Shares
  const amountPlaceholder =
    splitMethod === SplitMethod.Shares
      ? 'form.shares'
      : splitMethod === SplitMethod.BalanceChanges
        ? 'form.change'
        : 'form.amount'
  const filterSuggestions = (suggestions: Member[]) => {
    if (splitMethod === SplitMethod.Lend) {
      return suggestions.filter((suggestion) => suggestion.id !== user?.id)
    }

    return suggestions
  }

  const flattenedStyles = StyleSheet.flatten(style) ?? {}

  function submit() {
    const toSave = formState.entries.filter(
      (entry) => entry.entry.trim().length > 0 || entry.user !== undefined || entry.amount !== ''
    )

    onSubmit({
      title: formState.title,
      timestamp: formState.timestamp,
      paidByIndex: formState.paidByIndex,
      entries: toSave,
      total: total.length > 0 ? total : undefined,
    })
  }

  async function setMembers(fetchMembers: () => Promise<Member[]>) {
    if (fetchingMembers) {
      return
    }

    setFetchingMembers(true)
    const entries = (await fetchMembers()).map((member) => {
      const entry = formState.entries.find((entry) => entry.user?.id === member.id)
      return {
        user: member,
        entry: member.email ?? entry?.entry ?? '',
        amount: entry?.amount ?? '',
      }
    })
    const paidById = formState.entries[formState.paidByIndex].user?.id ?? initialEntries[0].user?.id
    const paidByIndex = entries.findIndex((entry) => entry.user?.id === paidById)

    updateForm({
      type: 'setEntries',
      paidByIndex: paidByIndex === -1 ? 0 : paidByIndex,
      entries: entries,
    })
    setFetchingMembers(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[{ paddingBottom: 128, gap: 12 }, style]}
        keyboardShouldPersistTaps='handled'
      >
        {showDetails && (
          <DetailsPane
            formState={formState}
            groupInfo={groupInfo}
            updateForm={updateForm}
            showPaidByHint={showPaidByHint}
          />
        )}

        {showTotalInput && (
          <LargeTextInput
            placeholder={t('form.totalPaid')}
            value={total}
            onChangeText={(value) => setTotal(value)}
            icon='sell'
            keyboardType='decimal-pad'
          />
        )}

        {showCalendar && (
          <CalendarPane
            initialDate={formState.timestamp}
            onDateChange={(timestamp) => {
              updateForm({ type: 'setTimestamp', timestamp: timestamp })
            }}
            showDateOnHeader
            startCollapsed
          />
        )}

        {showSuggestions && (
          <SuggestionsPane
            groupInfo={groupInfo}
            hiddenIds={formState.entries
              .map((entry) => entry.user?.id)
              .filter((id) => id !== undefined)}
            onSelect={(user) => {
              updateForm({
                type: 'setEntries',
                paidByIndex: formState.paidByIndex,
                entries: [...formState.entries, { user, entry: user.email ?? '', amount: '' }],
              })
            }}
          />
        )}

        {showEntries && (
          <EntriesPane
            formState={formState}
            groupInfo={groupInfo}
            updateForm={updateForm}
            scrollRef={scrollRef}
            showPayerSelector={showPayerSelector}
            showAddAllMembers={showAddAllMembers}
            setMembers={setMembers}
            showPayerEntry={showPayerEntry}
            filterSuggestions={filterSuggestions}
            balanceKeyboardType={balanceKeyboardType}
            amountPlaceholder={amountPlaceholder}
            integersOnly={integersOnly}
          />
        )}
      </ScrollView>

      <View
        style={{
          gap: 8,
          paddingLeft: flattenedStyles.paddingLeft,
          paddingRight: flattenedStyles.paddingRight,
        }}
      >
        {error && <ErrorText>{error}</ErrorText>}
        <Button
          leftIcon={buttonIconLocation === 'left' ? buttonIcon : undefined}
          rightIcon={buttonIconLocation === 'right' ? buttonIcon : undefined}
          title={t(buttonTitle)}
          onPress={submit}
          isLoading={waiting || fetchingMembers}
        />
      </View>
    </View>
  )
}
