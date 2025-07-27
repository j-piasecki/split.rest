import { FormActionType, FormData, SplitEntryData } from './formData'
import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { TextInput, TextInputRef } from '@components/TextInput'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardTypeOptions, LayoutRectangle, Pressable, ScrollView, View } from 'react-native'
import { CurrencyUtils, LanguageTranslationKey, UserWithDisplayName } from 'shared'

export interface SplitEntryProps {
  scrollRef?: React.RefObject<ScrollView | null>
  groupId: number
  formState: FormData
  entry: SplitEntryData
  paidByThis: boolean
  updateForm: React.Dispatch<FormActionType>
  index: number
  showPayerSelector: boolean
  parentLayout?: React.RefObject<LayoutRectangle | null>
  focusIndex?: number
  first: boolean
  last: boolean
  filterSuggestions?: (suggestions: UserWithDisplayName[]) => UserWithDisplayName[]
  balanceKeyboardType?: KeyboardTypeOptions
  amountPlaceholder: LanguageTranslationKey
  integersOnly?: boolean
}

export function SplitEntry({
  scrollRef,
  groupId,
  formState,
  entry,
  paidByThis,
  updateForm,
  index,
  parentLayout,
  focusIndex,
  showPayerSelector,
  first,
  last,
  filterSuggestions,
  amountPlaceholder,
  balanceKeyboardType = 'decimal-pad',
  integersOnly = false,
}: SplitEntryProps) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)
  const { t } = useTranslation()
  const amountInputRef = useRef<TextInputRef>(null)

  const showDeleteButton =
    entry.user !== undefined || entry.entry.trim().length > 0 || entry.amount.trim().length > 0

  function scrollToThis() {
    if (layout.current && parentLayout?.current && !first) {
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
      style={[
        {
          zIndex: formState.entries.length - index,
          paddingBottom: last ? 8 : 0,
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 4,
          marginBottom: 2,
        },
        last && {
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
          paddingLeft: 16,
          paddingVertical: 4,
        }}
      >
        {showPayerSelector && (
          <Pressable
            disabled={paidByThis || entry.user === undefined}
            onPress={() => updateForm({ type: 'setPaidBy', index })}
            style={{ marginRight: 8 }}
            tabIndex={-1}
          >
            <Icon
              name='payments'
              size={24}
              color={paidByThis ? theme.colors.secondary : theme.colors.outlineVariant}
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
          filterSuggestions={(users) => {
            const filteredDefault = users.filter(
              (u) =>
                u.email === entry.entry ||
                formState.entries.every((e) => e.user === undefined || e.user.email !== u.email)
            )
            return filterSuggestions?.(filteredDefault) ?? filteredDefault
          }}
        />

        <TextInput
          placeholder={t(amountPlaceholder)}
          value={entry.amount}
          ref={amountInputRef}
          selectTextOnFocus
          focusIndex={focusIndex === undefined ? undefined : focusIndex + 1}
          keyboardType={balanceKeyboardType}
          onChangeText={(val) => {
            val = val.replace(',', '.')
            updateForm({ type: 'setAmount', index, amount: val })
          }}
          style={{ flex: 2, margin: 4, maxWidth: 72 }}
          onFocus={scrollToThis}
          onBlur={() => {
            const amountNum = Number(entry.amount)
            if (!Number.isNaN(amountNum) && entry.amount.length > 0) {
              const formattedAmount = integersOnly
                ? Math.floor(amountNum).toString()
                : CurrencyUtils.format(amountNum)
              updateForm({ type: 'setAmount', index, amount: formattedAmount })
            }
          }}
        />

        <View
          style={{
            opacity: showDeleteButton ? 1 : 0,
            transform: [{ translateY: 2 }],
          }}
        >
          <RoundIconButton
            disabled={!showDeleteButton}
            icon='close'
            size={20}
            onPress={() => updateForm({ type: 'remove', index })}
            style={{ marginTop: 0, padding: 4 }}
            tabIndex={-1}
          />
        </View>
      </View>
    </View>
  )
}
