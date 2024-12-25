import { DetailsPane } from './DetailsPane'
import { EntriesPane } from './EntriesPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { IconName } from '@components/Icon'
import { Text } from '@components/Text'
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
  waiting?: boolean
  onSubmit: (data: FormData) => void
  error?: string | null
  showDetails?: boolean
  buttonIcon?: IconName
  buttonTitle?: LanguageTranslationKey
  buttonIconLocation?: 'left' | 'right'
}

export function SplitForm({
  groupInfo,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  waiting,
  onSubmit,
  error,
  showDetails = true,
  buttonIcon = 'save',
  buttonTitle = 'form.save',
  buttonIconLocation = 'left',
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
      .map((entry) => ({
        email: entry.email.trim(),
        amount: entry.amount.trim(),
        user: entry.user,
      }))
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
        {showDetails && (
          <DetailsPane formState={formState} groupInfo={groupInfo} updateForm={updateForm} />
        )}

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
