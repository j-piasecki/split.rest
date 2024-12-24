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
import React from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, LayoutRectangle, Pressable, ScrollView, View } from 'react-native'
import { GroupInfo, User } from 'shared'

export interface SplitEntryData {
  email: string
  amount: string
  user?: User
}

function SplitEntry({
  scrollRef,
  groupId,
  paidByThis,
  setPaidByIndex,
  email,
  amount,
  user,
  update,
  zIndex,
  parentLayout,
}: {
  scrollRef?: React.RefObject<ScrollView>
  groupId: number
  paidByThis: boolean
  setPaidByIndex: () => void
  email: string
  amount: string
  user?: User
  update: (data: SplitEntryData) => void
  zIndex: number
  parentLayout?: React.RefObject<LayoutRectangle | null>
}) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()

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
        zIndex: zIndex,
      }}
    >
      <Pressable onPress={setPaidByIndex} style={{ marginRight: 8 }} tabIndex={-1}>
        <Icon
          name='currency'
          size={24}
          color={paidByThis ? theme.colors.secondary : theme.colors.outlineVariant}
        />
      </Pressable>

      {!user && (
        <TextInputWithUserSuggestions
          groupId={groupId}
          value={email}
          selectTextOnFocus
          onSuggestionSelect={(user) => {
            update({ email: user.email, amount, user })
          }}
          onChangeText={(val) => {
            update({ email: val, amount, user: undefined })
          }}
          style={{ flex: 5, margin: 4 }}
          onFocus={scrollToThis}
        />
      )}

      {user && (
        <View
          style={{
            flex: 5,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 4,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
          }}
        >
          <ProfilePicture userId={user.id} size={isSmallScreen ? 20 : 24} />
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
            {user.name}
          </Text>
          <RoundIconButton
            icon='close'
            size={20}
            onPress={() => update({ email: '', amount: '', user: undefined })}
            style={{ padding: 4 }}
          />
          <RoundIconButton
            icon='editAlt'
            size={20}
            onPress={() => update({ email, amount, user: undefined })}
            style={{ padding: 4 }}
          />
        </View>
      )}

      <TextInput
        placeholder={t('form.amount')}
        value={String(amount)}
        selectTextOnFocus
        keyboardType='decimal-pad'
        onChangeText={(val) => {
          val = val.replace(',', '.')
          update({ email, amount: Number.isNaN(Number(val)) ? amount : val, user })
        }}
        style={{ flex: 2, margin: 4, maxWidth: 72 }}
        onFocus={scrollToThis}
        onBlur={() => {
          const amountNum = Number(amount)
          if (!Number.isNaN(amountNum) && amount.length > 0) {
            update({ email, amount: amountNum.toFixed(2), user })
          }
        }}
      />
    </View>
  )
}

interface SplitEntriesPaneProps {
  entries: SplitEntryData[]
  groupInfo: GroupInfo
  paidByIndex: number
  setPaidByIndex: (index: number) => void
  setEntries: (entries: SplitEntryData[]) => void
  scrollRef?: React.RefObject<ScrollView>
}

function SplitEntriesPane({
  entries,
  groupInfo,
  paidByIndex,
  setPaidByIndex,
  setEntries,
  scrollRef,
}: SplitEntriesPaneProps) {
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
      {entries.map((entry, index) => (
        <React.Fragment key={index}>
          <SplitEntry
            scrollRef={scrollRef}
            groupId={groupInfo.id}
            paidByThis={paidByIndex === index}
            setPaidByIndex={() => setPaidByIndex(index)}
            email={entry.email}
            amount={String(entry.amount)}
            user={entry.user}
            zIndex={entries.length - index}
            parentLayout={layout}
            update={(data) => {
              let newEntries = [...entries]
              newEntries[index] = data

              const paidBy = newEntries[paidByIndex]

              newEntries = newEntries.filter((entry) => entry.email !== '' || entry.amount !== '')

              const newPaidByIndex = newEntries.findIndex((entry) => entry.email === paidBy.email)

              if (
                newEntries.length === 0 ||
                newEntries[newEntries.length - 1].email !== '' ||
                newEntries[newEntries.length - 1].amount !== ''
              ) {
                newEntries.push({ email: '', amount: '' })
              }

              setEntries(newEntries)
              setPaidByIndex(newPaidByIndex === -1 ? 0 : newPaidByIndex)
            }}
          />
        </React.Fragment>
      ))}
    </Pane>
  )
}

export interface FormData {
  title: string
  paidBy: string
  entries: SplitEntryData[]
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
  const [entries, setEntries] = useState<SplitEntryData[]>(initialEntries)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [paidByIndex, setPaidByIndex] = useState(initialPaidByIndex ?? 0)
  const { t } = useTranslation()

  const toBePaid = useRef(0)
  const sumFromEntries = entries.reduce((acc, entry) => acc + Number(entry.amount), 0)
  if (!Number.isNaN(sumFromEntries)) {
    toBePaid.current = sumFromEntries
  }

  function submit() {
    const paidBy = entries[paidByIndex]
    const toSave = entries
      .map((entry) => ({ email: entry.email.trim(), amount: entry.amount.trim() }))
      .filter((entry) => entry.email !== '' && entry.amount !== '')

    onSubmit({
      title: title,
      paidBy: paidBy.email,
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
            value={title}
            onChangeText={setTitle}
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
                {entries[paidByIndex].user?.name ?? entries[paidByIndex].email}{' '}
              </Text>
              has paid
              <Text style={{ color: theme.colors.primary }}> {toBePaid.current} </Text>
              {groupInfo.currency}
            </Text>
          </View>
        </Pane>

        <SplitEntriesPane
          entries={entries}
          groupInfo={groupInfo}
          paidByIndex={paidByIndex}
          setPaidByIndex={setPaidByIndex}
          setEntries={setEntries}
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
