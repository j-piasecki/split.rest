import ModalScreen from '@components/ModalScreen'
import { FormData, SplitForm } from '@components/SplitForm'
import { createSplit } from '@database/createSplit'
import { getGroupInfo } from '@database/getGroupInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { BalanceChange, GroupInfo, User } from 'shared'

function Form({ groupInfo, user }: { groupInfo: GroupInfo; user: User }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)

  async function save({ title, paidBy, entries }: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange } = await validateSplitForm({
        title,
        paidBy,
        entries,
      })

      await createSplit(
        groupInfo.id,
        payerId,
        title,
        sumToSave,
        Date.now(),
        balanceChange as BalanceChange[]
      )

      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace(`/${groupInfo.id}`)
      }

      setWaiting(false)
      setTimeout(() => {
        location.reload()
      }, 100)
    } catch (error) {
      setError(error as string)
    } finally {
      setWaiting(false)
    }
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
