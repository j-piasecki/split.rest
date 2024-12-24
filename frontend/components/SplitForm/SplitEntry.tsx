import { FormActionType, FormData } from './formData'
import { Icon } from '@components/Icon'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, Pressable, ScrollView, View } from 'react-native'

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
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()

  const entry = formState.entries[index]
  const showDeleteButton = entry.email.trim().length > 0 || entry.amount.trim().length > 0

  function scrollToThis() {
    if (layout.current && parentLayout?.current) {
      scrollRef?.current?.scrollTo({
        y: parentLayout.current.y + layout.current.y - 200,
        animated: true,
      })
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

      <View style={{ flex: 5 }}>
        {!entry.user && (
          <TextInputWithUserSuggestions
            groupId={groupId}
            value={entry.email}
            selectTextOnFocus
            autoFocus={entry.focusOnMount}
            onSuggestionSelect={(user) => {
              updateForm({ type: 'setUser', index, user })
            }}
            onChangeText={(val) => {
              updateForm({ type: 'setEmail', index, email: val })
            }}
            style={{ flex: 1, margin: 4 }}
            onFocus={() => {
              scrollToThis()
              updateForm({ type: 'clearFocusOnMount', index })
            }}
            filterSuggestions={(user) =>
              user.filter(
                (u) =>
                  u.email === entry.email || formState.entries.every((e) => e.email !== u.email)
              )
            }
          />
        )}

        {entry.user && (
          <Pressable
            onPress={() => updateForm({ type: 'setUser', index, user: undefined })}
            tabIndex={-1}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 4,
              paddingVertical: 8,
              marginTop: 4,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outlineVariant,
            }}
          >
            <ProfilePicture userId={entry.user.id} size={isSmallScreen ? 20 : 24} />
            <Text
              style={{
                flex: 1,
                marginLeft: 6,
                color: theme.colors.onSurface,
                fontSize: isSmallScreen ? 16 : 18,
                fontWeight: 600,
              }}
              numberOfLines={1}
            >
              {entry.user.name}
            </Text>
          </Pressable>
        )}
      </View>

      <TextInput
        placeholder={t('form.amount')}
        value={entry.amount}
        selectTextOnFocus
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
