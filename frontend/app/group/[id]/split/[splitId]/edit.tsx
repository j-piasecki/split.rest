import ModalScreen from '@components/ModalScreen'
import { FormData, SplitForm } from '@components/SplitForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSplitInfo } from '@hooks/database/useSplitInfo'
import { useUpdateSplit } from '@hooks/database/useUpdateSplit'
import { useTheme } from '@styling/theme'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { BalanceChange, GroupInfo, SplitWithUsers } from 'shared'

function Form({ groupInfo, splitInfo }: { groupInfo: GroupInfo; splitInfo: SplitWithUsers }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [waiting, setWaiting] = useState(false)
  const { mutateAsync: updateSplit } = useUpdateSplit()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange } = await validateSplitForm(form)

      await updateSplit({
        splitId: splitInfo.id,
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave,
        timestamp: splitInfo.timestamp,
        balances: balanceChange as BalanceChange[],
      })

      router.replace(`/group/${groupInfo.id}`)
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
  const { id, splitId } = useLocalSearchParams()
  const theme = useTheme()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: splitInfo } = useSplitInfo(Number(id), Number(splitId))

  return (
    <ModalScreen returnPath={`/group/${id}`} title='Edit split' maxWidth={500}>
      {(!groupInfo || !splitInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {groupInfo && splitInfo && <Form groupInfo={groupInfo} splitInfo={splitInfo} />}
    </ModalScreen>
  )
}
