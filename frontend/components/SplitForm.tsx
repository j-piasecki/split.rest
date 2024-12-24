import { Button } from './Button'
import { Icon } from './Icon'
import { Pane } from './Pane'
import { ProfilePicture } from './ProfilePicture'
import { RoundIconButton } from './RoundIconButton'
import { TextInput } from './TextInput'
import { TextInputWithUserSuggestions } from './TextInputWithUserSuggestions'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import React, { useReducer, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, LayoutRectangle, Pressable, ScrollView, View } from 'react-native'
import { GroupInfo, User } from 'shared'

interface SplitEntryData {
  email: string
  amount: string
  user?: User
  focusOnMount?: boolean
}

export interface FormData {
  title: string
  paidByIndex: number
  entries: SplitEntryData[]
}

type ActionType =
  | {
      type: 'setEmail'
      index: number
      email: string
    }
  | {
      type: 'setAmount'
      index: number
      amount: string
    }
  | {
      type: 'remove'
      index: number
    }
  | {
      type: 'setUser'
      index: number
      user: User | undefined
    }
  | {
      type: 'setPaidBy'
      index: number
    }
  | {
      type: 'setTitle'
      title: string
    }
  | {
      type: 'clearFocusOnMount'
      index: number
    }

function entriesReducer(state: FormData, action: ActionType): FormData {
  const newState = { ...state }
  const paidBy = newState.entries[newState.paidByIndex]

  switch (action.type) {
    case 'setTitle':
      newState.title = action.title
      return newState

    case 'setPaidBy':
      newState.paidByIndex = action.index
      return newState

    case 'clearFocusOnMount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, focusOnMount: false } : entry
      )

      return newState

    case 'setUser':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, user: action.user } : entry
      )

      if (action.user) {
        newState.entries[action.index].email = action.user.email
      } else {
        newState.entries[action.index].focusOnMount = true
      }
      return newState

    case 'remove':
      newState.entries = newState.entries.filter((_, i) => i !== action.index)
      break

    case 'setEmail':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, email: action.email } : entry
      )
      break

    case 'setAmount':
      newState.entries = newState.entries.map((entry, i) =>
        i === action.index ? { ...entry, amount: action.amount } : entry
      )
      break
  }

  newState.entries = newState.entries.filter((entry) => entry.email !== '' || entry.amount !== '')

  if (
    newState.entries.length === 0 ||
    newState.entries[newState.entries.length - 1].email !== '' ||
    newState.entries[newState.entries.length - 1].amount !== ''
  ) {
    newState.entries.push({ email: '', amount: '' })
  }

  if (state.entries.length !== newState.entries.length) {
    const newPaidByIndex = newState.entries.findIndex((entry) => entry.email === paidBy.email)
    newState.paidByIndex = newPaidByIndex === -1 ? 0 : newPaidByIndex
  }

  return newState
}

function useEntryData(initial: FormData) {
  return useReducer<React.Reducer<FormData, ActionType>, FormData>(
    entriesReducer,
    {} as FormData,
    () => initial
  )
}

function SplitEntry({
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
  updateForm: React.Dispatch<ActionType>
  index: number
  parentLayout?: React.RefObject<LayoutRectangle | null>
}) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()

  const entry = formState.entries[index]

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

      <View style={{ width: 20, height: 20 }}>
        <RoundIconButton
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

interface SplitEntriesPaneProps {
  formState: FormData
  updateForm: React.Dispatch<ActionType>
  groupInfo: GroupInfo
  scrollRef?: React.RefObject<ScrollView>
}

function SplitEntriesPane({ formState, updateForm, groupInfo, scrollRef }: SplitEntriesPaneProps) {
  const { t } = useTranslation()
  const layout = useRef<LayoutRectangle | null>(null)

  return (
    <Pane
      icon='group'
      title={t('splitInfo.participants')}
      textLocation='start'
      onLayout={(event) => {
        layout.current = event.nativeEvent.layout
      }}
      containerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        overflow: 'visible',
      }}
    >
      {formState.entries.map((entry, index) => (
        <React.Fragment key={index}>
          <SplitEntry
            scrollRef={scrollRef}
            groupId={groupInfo.id}
            index={index}
            formState={formState}
            updateForm={updateForm}
            parentLayout={layout}
          />
        </React.Fragment>
      ))}
    </Pane>
  )
}

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
  const [formState, updateForm] = useEntryData({
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

        <SplitEntriesPane
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
