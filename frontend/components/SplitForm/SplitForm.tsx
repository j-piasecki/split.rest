import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupInfo } from 'shared'

export interface SplitFormProps {
  groupInfo: GroupInfo
  initialTitle?: string
  initialEntries: SplitEntryData[]
  initialPaidByIndex?: number
  waiting: boolean
  onSubmit: (data: FormData) => void
  error?: string | null

  showTitle?: boolean
  showPaidByHint?: boolean
}

export function SplitForm({
  groupInfo,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  waiting,
  onSubmit,
  error,
  showTitle,
  showPaidByHint,
}: SplitFormProps) {
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const [formState, updateForm] = useFormData({
    title: initialTitle ?? '',
    paidByIndex: initialPaidByIndex ?? 0,
    entries: initialEntries,
  })
  const { t } = useTranslation()

  function submit() {
    const toSave = formState.entries
      .map((entry) => ({ email: entry.email.trim(), amount: entry.amount.trim() }))
      .filter((entry) => entry.email !== '' && entry.amount !== '')

    onSubmit({
      title: formState.title,
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
        <DetailsPane
          formState={formState}
          groupInfo={groupInfo}
          updateForm={updateForm}
          showTitle={showTitle}
          showPaidByHint={showPaidByHint}
        />

        <EntriesPane
          formState={formState}
          groupInfo={groupInfo}
          updateForm={updateForm}
          scrollRef={scrollRef}
        />
      </ScrollView>

      <View style={{ gap: 8 }}>
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

        <View>
          {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
          {!waiting && <Button leftIcon='save' title={t('form.save')} onPress={submit} />}
        </View>
      </View>
    </View>
  )
}
