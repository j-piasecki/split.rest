import ModalScreen from '@components/ModalScreen'
import { createSplit } from '@database/createSplit'
import { getUserByEmail } from '@database/getUserByEmail'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Button, ScrollView, Text, TextInput, View } from 'react-native'
import { BalanceChange } from 'shared'

interface EntryData {
  email: string
  amount: string
}

function Entry({
  email,
  amount,
  update,
}: {
  email: string
  amount: string
  update: (data: EntryData) => void
}) {
  const theme = useTheme()

  return (
    <View style={{ flexDirection: 'row' }}>
      <TextInput
        placeholder='E-mail'
        value={email}
        onChangeText={(val) => {
          update({ email: val, amount })
        }}
        style={{
          flex: 2,
          borderWidth: 1,
          borderColor: theme.colors.text,
          borderRadius: 8,
          padding: 8,
          margin: 4,
          color: theme.colors.text,
        }}
      />
      <TextInput
        placeholder='Amount'
        value={String(amount)}
        onChangeText={(val) => {
          update({ email, amount: Number.isNaN(Number(val)) ? amount : val })
        }}
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: theme.colors.text,
          borderRadius: 8,
          padding: 8,
          margin: 4,
          color: theme.colors.text,
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
  const [amountPaid, setAmountPaid] = useState('')
  const [title, setTitle] = useState('')
  const [waiting, setWaiting] = useState(false)

  async function save() {
    const toSave = entries.filter((entry) => entry.email !== '' && entry.amount !== '')

    if (toSave.length < 2) {
      setError('At least two entries are required')
      return
    }

    const sum = toSave.reduce((acc, entry) => acc + Number(entry.amount), 0)
    const paid = Number(amountPaid)

    if (Math.abs(paid - sum) > 0.0001) {
      setError('Amound paid does not match sum of entries')
      return
    }

    if (!title) {
      setError('Title is required')
      return
    }

    const balanceChange: BalanceChange[] = await Promise.all(
      toSave.map(async (entry) => {
        const change =
          entry.email === user!.email ? paid - Number(entry.amount) : -Number(entry.amount)
        const userData = await getUserByEmail(entry.email)

        if (!userData) {
          setWaiting(false)
          setError('User ' + entry.email + ' not found')
          throw new Error('User ' + entry.email + ' not found')
        }

        return {
          id: userData.id,
          change: change,
        }
      })
    )

    setWaiting(true)
    setError('')

    createSplit(Number(id as string), title, paid, balanceChange)
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
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {entries.map((entry, index) => (
          <Entry
            key={index}
            email={entry.email}
            amount={String(entry.amount)}
            update={(data) => {
              let newEntries = [...entries]
              newEntries[index] = data

              newEntries = newEntries.filter((entry) => entry.email !== '' || entry.amount !== '')

              if (
                newEntries.length === 0 ||
                newEntries[newEntries.length - 1].email !== '' ||
                newEntries[newEntries.length - 1].amount !== ''
              ) {
                newEntries.push({ email: '', amount: '' })
              }

              setEntries(newEntries)
            }}
          />
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 16,
        }}
      >
        <Text style={{ flex: 1, color: theme.colors.text }}>Title:</Text>
        <TextInput
          placeholder='Title'
          value={title}
          onChangeText={setTitle}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.text,
            borderRadius: 8,
            padding: 8,
            margin: 4,
            color: theme.colors.text,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 16,
        }}
      >
        <Text style={{ flex: 1, color: theme.colors.text }}>Total paid:</Text>
        <TextInput
          placeholder='Amount'
          value={amountPaid}
          onChangeText={(a) => {
            if (Number.isNaN(Number(a))) {
              setAmountPaid(amountPaid)
            } else {
              setAmountPaid(a)
            }
          }}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.text,
            borderRadius: 8,
            padding: 8,
            margin: 4,
            color: theme.colors.text,
          }}
        />
      </View>

      <View style={{ margin: 16 }}>
        {waiting && <ActivityIndicator size='small' color={theme.colors.text} />}
        {!waiting && <Button title='Save' onPress={save} />}
        {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
      </View>
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()

  return (
    <ModalScreen returnPath={`/${id}`} title='Add split'>
      <Form />
    </ModalScreen>
  )
}
