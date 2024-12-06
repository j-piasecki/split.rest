import ModalScreen from '@components/ModalScreen'
import { FormData, SplitForm } from '@components/SplitForm'
import { createSplit } from '@database/createSplit'
import { getGroupInfo } from '@database/getGroupInfo'
import { getUserByEmail } from '@database/getUserByEmail'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { BalanceChange, GroupInfo, User } from 'shared'

function Form({ groupInfo, user }: { groupInfo: GroupInfo; user: User }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)

  async function save({ title, paidBy, entries: toSave }: FormData) {
    if (toSave.length < 2) {
      setError('At least two entries are required')
      return
    }
    for (const { email, amount } of toSave) {
      if (email === '' && amount === '') {
        continue
      }

      if (email === '' || amount === '') {
        setError('You need to fill both fields in the row')
        return
      }
    }

    const sumToSave = toSave.reduce((acc, entry) => acc + Number(entry.amount), 0)

    if (Number.isNaN(sumToSave)) {
      setError('Amounts must be numbers')
      return
    }

    if (sumToSave < 0.01) {
      setError('Total must be greater than 0')
      return
    }

    if (!title) {
      setError('Title is required')
      return
    }

    if (title.length > 512) {
      setError('Title is too long')
      return
    }

    if (toSave.find((entry) => entry.email === paidBy) === undefined) {
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
          entry.email === paidBy ? sumToSave - Number(entry.amount) : -Number(entry.amount)
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

        if (entry.email === paidBy) {
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
      groupInfo.id,
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
          router.replace(`/${groupInfo.id}`)
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
      <SplitForm
        initialEntries={[
          { email: user.email, amount: '' },
          { email: '', amount: '' },
        ]}
        groupInfo={groupInfo}
        onSubmit={save}
        waiting={waiting}
      />

      <View style={{ margin: 16 }}>
        {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
      </View>
    </View>
  )
}

export default function Modal() {
  const user = useAuth()
  const theme = useTheme()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const { id } = useLocalSearchParams()

  useEffect(() => {
    if (user) {
      getGroupInfo(Number(id as string)).then((group) => {
        setGroupInfo(group)
      })
    }
  }, [user, id])

  return (
    <ModalScreen returnPath={`/${id}`} title='Add split' maxWidth={500}>
      {(!user || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {user && groupInfo && <Form user={user} groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
