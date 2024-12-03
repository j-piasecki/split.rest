import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { TextInput } from '@components/TextInput'
import { TextInputWithSuggestions } from '@components/TextInputWithSuggestions'
import { createSplit } from '@database/createSplit'
import { getGroupInfo } from '@database/getGroupInfo'
import { getGroupMemberAutocompletions } from '@database/getGroupMembersAutocompletions'
import { getProfilePicture } from '@database/getProfilePicture'
import { getUserByEmail } from '@database/getUserByEmail'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput as TextInputRN,
  View,
} from 'react-native'
import { BalanceChange, User } from 'shared'

export interface EntryData {
  email: string
  amount: string
}

function Suggestion({
  user,
  update,
  textInputRef,
  amount,
  setShowSuggestions,
}: {
  user: User
  update: (data: EntryData) => void
  textInputRef: React.RefObject<TextInputRN>
  amount: string
  setShowSuggestions: (show: boolean) => void
}) {
  const theme = useTheme()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    getProfilePicture(user.photoURL).then(setProfilePicture)
  }, [user.photoURL])

  return (
    <Pressable
      onPointerDown={() => {
        setTimeout(() => {
          textInputRef.current?.focus()
        })
      }}
      onPress={() => {
        update({ email: user.email, amount })
        setShowSuggestions(false)
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Image
          source={{ uri: profilePicture ?? undefined }}
          style={{ width: 24, height: 24, borderRadius: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{user.name}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>{user.email}</Text>
        </View>
      </View>
    </Pressable>
  )
}

function Entry({
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
  update: (data: EntryData) => void
  zIndex: number
}) {
  const theme = useTheme()
  const ref = useRef<TextInputRN>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const getSuggestions = useCallback(
    (val: string) => getGroupMemberAutocompletions(groupId, val),
    [groupId]
  )

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
        {paidByThis && (
          <MaterialCommunityIcons name='cash-fast' size={24} color={theme.colors.secondary} />
        )}
        {!paidByThis && (
          <MaterialCommunityIcons name='cash' size={24} color={theme.colors.outlineVariant} />
        )}
      </Pressable>

      <TextInputWithSuggestions
        inputRef={ref}
        placeholder='E-mail'
        value={email}
        keyboardType='email-address'
        onChangeText={(val) => {
          update({ email: val, amount })
          setShowSuggestions(true)
        }}
        getSuggestions={getSuggestions}
        suggestionsVisible={showSuggestions}
        renderSuggestion={(user) => {
          return (
            <Suggestion
              user={user}
              update={update}
              textInputRef={ref}
              amount={amount}
              setShowSuggestions={setShowSuggestions}
            />
          )
        }}
        style={{ flex: 4, margin: 4 }}
      />
      <TextInput
        placeholder='Amount'
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

function Form() {
  const { id } = useLocalSearchParams()
  const user = useAuth()
  const router = useRouter()
  const theme = useTheme()
  const [entries, setEntries] = useState<EntryData[]>([
    { email: user!.email, amount: '' },
    { email: '', amount: '' },
  ])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [paidByIndex, setPaidByIndex] = useState(0)
  const [currency, setCurrency] = useState('')

  const [titleError, setTitleError] = useState(false)

  const toBePaid = useRef(0)
  const sumFromEntries = entries.reduce((acc, entry) => acc + Number(entry.amount), 0)
  if (!Number.isNaN(sumFromEntries)) {
    toBePaid.current = sumFromEntries
  }

  useEffect(() => {
    if (user) {
      getGroupInfo(Number(id as string)).then((group) => {
        setCurrency(group?.currency || '')
      })
    }
  }, [user, id])

  async function save() {
    for (const { email, amount } of entries) {
      if (email === '' && amount === '') {
        continue
      }

      if (email === '' || amount === '') {
        setError('You need to fill both fields in the row')
        return
      }
    }

    const paidBy = entries[paidByIndex]
    const toSave = entries.filter((entry) => entry.email !== '' && entry.amount !== '')

    if (toSave.length < 2) {
      setError('At least two entries are required')
      return
    }

    const sumToSave = toSave.reduce((acc, entry) => acc + Number(entry.amount), 0)

    if (Number.isNaN(sumToSave)) {
      setError('Amounts must be numbers')
      return
    }

    if (!title) {
      setError('Title is required')
      setTitleError(true)
      return
    }

    if (title.length > 512) {
      setError('Title is too long')
      setTitleError(true)
      return
    }

    if (toSave.find((entry) => entry.email === paidBy.email) === undefined) {
      setError('The payer data must be filled in')
      return
    }

    const emails = toSave.map((entry) => entry.email)
    if (new Set(emails).size !== emails.length) {
      setError('Duplicate e-mails are not allowed')
      return
    }

    let payerId: string | undefined

    const balanceChange: (BalanceChange | undefined)[] = await Promise.all(
      toSave.map(async (entry) => {
        const change =
          entry.email === paidBy.email ? sumToSave - Number(entry.amount) : -Number(entry.amount)
        const userData = await getUserByEmail(entry.email)

        if (!userData) {
          setWaiting(false)
          setError('User ' + entry.email + ' not found')
          return
        }

        if (Number(entry.amount) < 0) {
          setWaiting(false)
          setError('Amounts cannot be negative')
          return
        }

        if (entry.email === paidBy.email) {
          payerId = userData.id
        }

        return {
          id: userData.id,
          change: change,
        }
      })
    )

    if (balanceChange.findIndex((change) => change === undefined) !== -1) {
      return
    }

    if (!payerId) {
      setWaiting(false)
      setError('Payer not found')
      return
    }

    setWaiting(true)
    setError('')

    createSplit(
      Number(id as string),
      payerId,
      title,
      sumToSave,
      Date.now(),
      balanceChange as BalanceChange[]
    )
      .then(() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace(`/${id}`)
        }

        setWaiting(false)
        setTimeout(() => {
          location.reload()
        }, 100)
      })
      .catch((error) => {
        setError(error.message)
        setWaiting(false)
      })
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <TextInput
          placeholder='Title'
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 8 }}
          error={titleError}
          resetError={() => setTitleError(false)}
        />

        {entries.map((entry, index) => (
          <Entry
            key={index}
            groupId={Number(id as string)}
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
          {currency}
        </Text>
      </View>

      <View style={{ margin: 16 }}>
        {waiting && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
        {!waiting && <Button title='Save' onPress={save} />}
        {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
      </View>
    </View>
  )
}

export default function Modal() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()

  return (
    <ModalScreen returnPath={`/${id}`} title='Add split' maxWidth={500}>
      {!user && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {user && <Form />}
    </ModalScreen>
  )
}
