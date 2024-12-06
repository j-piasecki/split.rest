import ModalScreen from '@components/ModalScreen'
import { FormData, SplitForm } from '@components/SplitForm'
import { getGroupInfo } from '@database/getGroupInfo'
import { getSplitInfo } from '@database/getSplitInfo'
import { updateSplit } from '@database/updateSplit'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { BalanceChange, GroupInfo, SplitWithUsers } from 'shared'

function Form({ groupInfo, splitInfo }: { groupInfo: GroupInfo; splitInfo: SplitWithUsers }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange } = await validateSplitForm(form)

      await updateSplit(
        splitInfo.id,
        groupInfo.id,
        payerId,
        form.title,
        sumToSave,
        // TODO: allow to change date
        splitInfo.timestamp,
        balanceChange as BalanceChange[]
      )

      router.replace(`/${groupInfo.id}`)

      setTimeout(() => {
        location.reload()
      }, 100)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <SplitForm
        initialTitle={splitInfo.title}
        initialEntries={[
          ...splitInfo.users.map((user) => {
            if (user.id === splitInfo.paidById) {
              return {
                email: user.email,
                amount: (Number(splitInfo.total) - Number(user.change)).toFixed(2),
              }
            }
            return { email: user.email, amount: (-Number(user.change)).toFixed(2) }
          }),
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
  const [splitInfo, setSplitInfo] = useState<SplitWithUsers | null | undefined>(undefined)
  const { id, splitId } = useLocalSearchParams()

  useEffect(() => {
    if (user) {
      const groupId = Number(id as string)
      const splitIdNum = Number(splitId as string)

      getGroupInfo(groupId).then((group) => {
        setGroupInfo(group)
      })

      getSplitInfo(groupId, splitIdNum).then((split) => {
        setSplitInfo(split)
      })
    }
  }, [user, id, splitId])

  return (
    <ModalScreen returnPath={`/${id}`} title='Edit split' maxWidth={500}>
      {(!groupInfo || !splitInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {groupInfo && splitInfo && <Form groupInfo={groupInfo} splitInfo={splitInfo} />}
    </ModalScreen>
  )
}
