import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { CalendarPane } from '@components/CalendarPane'
import { ErrorText } from '@components/ErrorText'
import { IconName } from '@components/Icon'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import { GroupUserInfo, LanguageTranslationKey } from 'shared'

export interface SplitFormProps {
  groupInfo: GroupUserInfo
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
  style?: StyleProp<ViewStyle>
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
  style,
}: SplitFormProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [formState, updateForm] = useFormData({
    title: initialTitle ?? '',
    timestamp: initialTimestamp ?? Date.now(),
    paidByIndex: initialPaidByIndex ?? 0,
    entries: initialEntries,
  })
  const { t } = useTranslation()

  function submit() {
    const toSave = formState.entries.filter(
      (entry) => entry.user !== undefined || entry.amount !== ''
    )

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
        contentContainerStyle={[{ paddingBottom: 100, gap: 16 }, style]}
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
        <Button
          leftIcon={buttonIconLocation === 'left' ? buttonIcon : undefined}
          rightIcon={buttonIconLocation === 'right' ? buttonIcon : undefined}
          title={t(buttonTitle)}
          onPress={submit}
          isLoading={waiting}
        />
      </View>
    </View>
  )
}
