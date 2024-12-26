import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { IconName } from '@components/Icon'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupInfo, LanguageTranslationKey } from 'shared'

export interface SplitFormProps {
  groupInfo: GroupInfo
  initialTitle?: string | null
  initialEntries: SplitEntryData[]
  initialPaidByIndex?: number
  initialTimestamp?: number
  waiting?: boolean
  onSubmit: (data: FormData) => void
  error?: string | null
  showDetails?: boolean
  showCalendar?: boolean
  buttonIcon?: IconName
  buttonTitle?: LanguageTranslationKey
  buttonIconLocation?: 'left' | 'right'
}

export function SplitForm({
  groupInfo,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  initialTimestamp,
  waiting,
  onSubmit,
  error,
  showDetails = true,
  showCalendar = true,
  buttonIcon = 'save',
  buttonTitle = 'form.save',
  buttonIconLocation = 'left',
}: SplitFormProps) {
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const [formState, updateForm] = useFormData({
    title: initialTitle ?? '',
    timestamp: initialTimestamp ?? Date.now(),
    paidByIndex: initialPaidByIndex ?? 0,
    entries: initialEntries,
  })
  const { t } = useTranslation()

  function submit() {
    const toSave = formState.entries
      .map((entry) => ({
        email: entry.email.trim(),
        amount: entry.amount.trim(),
        user: entry.user,
      }))
      .filter((entry) => entry.email !== '' || entry.amount !== '')

    onSubmit({
      title: formState.title,
      timestamp: formState.timestamp,
      paidByIndex: formState.paidByIndex,
      entries: toSave,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100, gap: 16, paddingTop: 8 }}
        keyboardShouldPersistTaps='handled'
      >
        {showDetails && (
          <DetailsPane formState={formState} groupInfo={groupInfo} updateForm={updateForm} />
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

        <EntriesPane
          formState={formState}
          groupInfo={groupInfo}
          updateForm={updateForm}
          scrollRef={scrollRef}
        />
      </ScrollView>

      <View style={{ gap: 8 }}>
        {error && <ErrorText>{error}</ErrorText>}

        <View>
          {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
          {!waiting && (
            <Button
              leftIcon={buttonIconLocation === 'left' ? buttonIcon : undefined}
              rightIcon={buttonIconLocation === 'right' ? buttonIcon : undefined}
              title={t(buttonTitle)}
              onPress={submit}
            />
          )}
        </View>
      </View>
    </View>
  )
}
