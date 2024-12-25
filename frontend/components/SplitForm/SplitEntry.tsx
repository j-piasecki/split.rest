import { FormActionType, FormData } from './formData'
import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { TextInput } from '@components/TextInput'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LayoutRectangle,
  Pressable,
  ScrollView,
  TextInput as TextInputRN,
  View,
} from 'react-native'

export interface SplitEntryProps {
  scrollRef?: React.RefObject<ScrollView>
  groupId: number
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  index: number
  parentLayout?: React.RefObject<LayoutRectangle | null>
}

export function SplitEntry({
  scrollRef,
  groupId,
  formState,
  updateForm,
  index,
  parentLayout,
}: {
  scrollRef?: React.RefObject<ScrollView>
  groupId: number
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  index: number
  parentLayout?: React.RefObject<LayoutRectangle | null>
}) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)
  const { t } = useTranslation()
  const amountInputRef = useRef<TextInputRN>(null)

  const entry = formState.entries[index]
  const showDeleteButton = entry.email.trim().length > 0 || entry.amount.trim().length > 0

  function scrollToThis() {
    if (layout.current && parentLayout?.current) {
      const targetScroll = parentLayout.current.y + layout.current.y - 50
      setTimeout(() => {
        scrollRef?.current?.scrollTo({
          y: targetScroll,
          animated: true,
        })
      }, 100)
    }
  }

  return (
    <View
      onLayout={(event) => {
        layout.current = event.nativeEvent.layout
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        zIndex: formState.entries.length - index,
      }}
    >
      <Pressable
        disabled={formState.paidByIndex === index || entry.email.indexOf('@') === -1}
        onPress={() => updateForm({ type: 'setPaidBy', index })}
        style={{ marginRight: 8 }}
        tabIndex={-1}
      >
        <Icon
          name='currency'
          size={24}
          color={
            formState.paidByIndex === index ? theme.colors.secondary : theme.colors.outlineVariant
          }
        />
      </Pressable>

      <TextInputUserPicker
        groupId={groupId}
        value={entry.email}
        selectTextOnFocus
        submitBehavior='submit'
        containerStyle={{ flex: 5 }}
        user={entry.user}
        onClearSelection={() => updateForm({ type: 'setUser', index, user: undefined })}
        onSuggestionSelect={(user) => {
          updateForm({ type: 'setUser', index, user })
          amountInputRef.current?.focus()
        }}
        onChangeText={(val) => {
          updateForm({ type: 'setEmail', index, email: val })
        }}
        onFocus={() => {
          scrollToThis()
          updateForm({ type: 'clearFocusOnMount', index })
        }}
        filterSuggestions={(user) =>
          user.filter(
            (u) => u.email === entry.email || formState.entries.every((e) => e.email !== u.email)
          )
        }
        onSubmitEditing={() => amountInputRef.current?.focus()}
      />

      <TextInput
        placeholder={t('form.amount')}
        value={entry.amount}
        ref={amountInputRef}
        selectTextOnFocus
        submitBehavior='submit'
        keyboardType='decimal-pad'
        onChangeText={(val) => {
          val = val.replace(',', '.')
          updateForm({ type: 'setAmount', index, amount: val })
        }}
        style={{ flex: 2, margin: 4, maxWidth: 72 }}
        onFocus={scrollToThis}
        onBlur={() => {
          const amountNum = Number(entry.amount)
          if (!Number.isNaN(amountNum) && entry.amount.length > 0) {
            updateForm({ type: 'setAmount', index, amount: amountNum.toFixed(2) })
          }
        }}
        onSubmitEditing={() => {
          // TODO: focus next input
        }}
      />

      <View style={{ width: 20, height: 20, opacity: showDeleteButton ? 1 : 0 }}>
        <RoundIconButton
          disabled={!showDeleteButton}
          icon='close'
          size={20}
          onPress={() => updateForm({ type: 'remove', index })}
          style={{ position: 'absolute', marginTop: 0, padding: 4 }}
          tabIndex={-1}
        />
      </View>
    </View>
  )
}
