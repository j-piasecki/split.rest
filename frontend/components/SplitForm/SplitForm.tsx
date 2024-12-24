import { EntriesPane } from './EntriesPane'
import { FormData, SplitEntryData, useFormData } from './formData'
import { Button } from '@components/Button'
import { Pane } from '@components/Pane'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
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
}

export function SplitForm({
  groupInfo,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  waiting,
  onSubmit,
  error,
}: SplitFormProps) {
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const [formState, updateForm] = useFormData({
    title: initialTitle ?? '',
    paidByIndex: initialPaidByIndex ?? 0,
    entries: initialEntries,
  })
  const { t } = useTranslation()

  const toBePaid = useRef(0)
  const sumFromEntries = formState.entries.reduce((acc, entry) => acc + Number(entry.amount), 0)
  if (!Number.isNaN(sumFromEntries)) {
    toBePaid.current = sumFromEntries
  }

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
      >
        <Pane
          icon='receipt'
          title={t('splitInfo.details')}
          textLocation='start'
          containerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 16 }}
        >
          <TextInput
            placeholder={t('form.title')}
            value={formState.title}
            onChangeText={(value) => updateForm({ type: 'setTitle', title: value })}
            style={{ marginBottom: 8 }}
          />

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
                textAlign: 'center',
                color: theme.colors.outline,
                fontSize: 20,
                opacity: 0.7,
              }}
            >
              <Text style={{ color: theme.colors.primary }}>
                {formState.entries[formState.paidByIndex].user?.name ??
                  formState.entries[formState.paidByIndex].email}{' '}
              </Text>
              has paid
              <Text style={{ color: theme.colors.primary }}> {toBePaid.current} </Text>
              {groupInfo.currency}
            </Text>
          </View>
        </Pane>

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
