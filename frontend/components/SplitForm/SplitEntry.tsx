import { FormActionType, FormData } from './formData'
import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { TextInput, TextInputRef } from '@components/TextInput'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useTheme } from '@styling/theme'
import { SplitMethod, getSplitCreationContext } from '@utils/splitCreationContext'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, Platform, Pressable, ScrollView, View } from 'react-native'
import { CurrencyUtils } from 'shared'

export interface SplitEntryProps {
  scrollRef?: React.RefObject<ScrollView | null>
  groupId: number
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  index: number
  showPayerSelector: boolean
  parentLayout?: React.RefObject<LayoutRectangle | null>
  focusIndex?: number
}

export function SplitEntry({
  scrollRef,
  groupId,
  formState,
  updateForm,
  index,
  parentLayout,
  focusIndex,
  showPayerSelector,
}: SplitEntryProps) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)
  const { t } = useTranslation()
  const amountInputRef = useRef<TextInputRef>(null)

  const entry = formState.entries[index]
  const showDeleteButton =
    entry.user !== undefined || entry.entry.trim().length > 0 || entry.amount.trim().length > 0

  function scrollToThis() {
    if (layout.current && parentLayout?.current) {
      const targetScroll = parentLayout.current.y + layout.current.y
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
      {showPayerSelector && (
        <Pressable
          disabled={formState.paidByIndex === index || entry.user === undefined}
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
      )}

      <TextInputUserPicker
        groupId={groupId}
        value={entry.user?.email ?? entry.entry}
        selectTextOnFocus
        focusIndex={focusIndex}
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
        filterSuggestions={(users) =>
          users.filter(
            (u) =>
              u.email === entry.entry ||
              formState.entries.every((e) => e.user === undefined || e.user.email !== u.email)
          )
        }
      />

      <TextInput
        placeholder={t('form.amount')}
        value={entry.amount}
        ref={amountInputRef}
        selectTextOnFocus
        focusIndex={focusIndex === undefined ? undefined : focusIndex + 1}
        keyboardType={
          // TODO: do a nice ui for negative numbers, ios doesn't have a numeric keyboard with a minus sign WTF?
          getSplitCreationContext().splitMethod === SplitMethod.BalanceChanges
            ? Platform.OS === 'android'
              ? 'phone-pad'
              : 'numbers-and-punctuation'
            : 'decimal-pad'
        }
        onChangeText={(val) => {
          val = val.replace(',', '.')
          updateForm({ type: 'setAmount', index, amount: val })
        }}
        style={{ flex: 2, margin: 4, maxWidth: 72 }}
        onFocus={scrollToThis}
        onBlur={() => {
          const amountNum = Number(entry.amount)
          if (!Number.isNaN(amountNum) && entry.amount.length > 0) {
            updateForm({ type: 'setAmount', index, amount: CurrencyUtils.format(amountNum) })
          }
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
