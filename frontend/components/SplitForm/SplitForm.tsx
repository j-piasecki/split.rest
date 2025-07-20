import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { SuggestionsPane } from './SuggestionsPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { IconName } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardTypeOptions,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { GroupUserInfo, LanguageTranslationKey, UserWithDisplayName } from 'shared'

export interface SplitFormProps {
  groupInfo: GroupUserInfo
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
  showEntries?: boolean
  showSuggestions?: boolean
  showTotalInput?: boolean
  buttonIcon?: IconName
  buttonTitle?: LanguageTranslationKey
  buttonIconLocation?: 'left' | 'right'
  style?: StyleProp<ViewStyle>
  showPayerSelector?: boolean
  showPaidByHint?: boolean
  showAddAllMembers?: boolean
  showPayerEntry?: boolean
  filterSuggestions?: (suggestions: UserWithDisplayName[]) => UserWithDisplayName[]
  balanceKeyboardType?: KeyboardTypeOptions
}

export function SplitForm({
  groupInfo,
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
  showEntries = true,
  showSuggestions = true,
  showTotalInput = false,
  buttonIcon = 'save',
  buttonTitle = 'form.save',
  buttonIconLocation = 'left',
  showPayerSelector = true,
  showPaidByHint = true,
  showAddAllMembers = true,
  showPayerEntry = true,
  style,
  filterSuggestions,
  balanceKeyboardType,
}: SplitFormProps) {
  const scrollRef = useRef<ScrollView>(null)
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
  const { t } = useTranslation()

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

  async function setMembers(fetchMembers: () => Promise<UserWithDisplayName[]>) {
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
