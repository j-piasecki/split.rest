import { Button } from './Button'
import { Icon } from './Icon'
import { TextInput } from './TextInput'
import { TextInputWithUserSuggestions } from './TextInputWithUserSuggestions'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { GroupInfo } from 'shared'

export interface SplitEntryData {
  email: string
  amount: string
}

function SplitEntry({
  groupId,
  paidByThis,
  setPaidByIndex,
  email,
  amount,
  update,
  zIndex,
}: {
  groupId: number
  paidByThis: boolean
  setPaidByIndex: () => void
  email: string
  amount: string
  update: (data: SplitEntryData) => void
  zIndex: number
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        zIndex: zIndex,
      }}
    >
      <Pressable onPress={setPaidByIndex} style={{ marginRight: 8 }}>
        {paidByThis && <Icon name='currency' size={24} color={theme.colors.secondary} />}
        {!paidByThis && <Icon name='currency' size={24} color={theme.colors.outlineVariant} />}
      </Pressable>

      <TextInputWithUserSuggestions
        groupId={groupId}
        value={email}
        onSuggestionSelect={(user) => {
          update({ email: user.email, amount })
        }}
        onChangeText={(val) => {
          update({ email: val, amount })
        }}
        style={{ flex: 4, margin: 4 }}
      />
      <TextInput
        placeholder={t('form.amount')}
        value={String(amount)}
        keyboardType='decimal-pad'
        onChangeText={(val) => {
          val = val.replace(',', '.')
          update({ email, amount: Number.isNaN(Number(val)) ? amount : val })
        }}
        style={{ flex: 2, margin: 4 }}
        onBlur={() => {
          const amountNum = Number(amount)
          if (!Number.isNaN(amountNum) && amount.length > 0) {
            update({ email, amount: amountNum.toFixed(2) })
          }
        }}
      />
    </View>
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
}

export function SplitForm({
  groupInfo,
  initialTitle,
  initialEntries,
  initialPaidByIndex,
  waiting,
  onSubmit,
}: SplitFormProps) {
  const theme = useTheme()
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
      .filter((entry) => entry.email !== '' || entry.amount !== '')
    onSubmit({
      title: title,
      paidBy: paidBy.email,
      entries: toSave,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <TextInput
          placeholder={t('form.title')}
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 8 }}
        />

        {entries.map((entry, index) => (
          <SplitEntry
            key={index}
            groupId={groupInfo.id}
            paidByThis={paidByIndex === index}
            setPaidByIndex={() => setPaidByIndex(index)}
            email={entry.email}
            amount={String(entry.amount)}
            zIndex={entries.length - index}
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
        ))}
      </ScrollView>

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
          <Text style={{ color: theme.colors.primary }}>{entries[paidByIndex].email} </Text>
          has paid
          <Text style={{ color: theme.colors.primary }}> {toBePaid.current} </Text>
          {groupInfo.currency}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
        {!waiting && <Button leftIcon='save' title={t('form.save')} onPress={submit} />}
      </View>
    </View>
  )
}
