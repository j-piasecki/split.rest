import ModalScreen from '@components/ModalScreen'
import { FormData, SplitForm } from '@components/SplitForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSplitInfo } from '@hooks/database/useSplitInfo'
import { useUpdateSplit } from '@hooks/database/useUpdateSplit'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { BalanceChange, GroupInfo, SplitWithUsers } from 'shared'

function Form({ groupInfo, splitInfo }: { groupInfo: GroupInfo; splitInfo: SplitWithUsers }) {
  const router = useRouter()
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)
  const { mutateAsync: updateSplit } = useUpdateSplit()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange, timestamp } = await validateSplitForm(form)

      await updateSplit({
        splitId: splitInfo.id,
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave,
        timestamp: timestamp,
        balances: balanceChange as BalanceChange[],
      })

      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
    } finally {
      setWaiting(false)
    }
  }

  const initialEntries = [
    ...splitInfo.users.map((user) => {
      if (user.id === splitInfo.paidById) {
        return {
          userOrEmail: user,
          amount: CurrencyUtils.format(Number(splitInfo.total) - Number(user.change)),
        }
      }
      return { userOrEmail: user, amount: CurrencyUtils.format(-Number(user.change)) }
    }),
    { userOrEmail: '', amount: '' },
  ]

  const initialPaidByIndex = splitInfo.users.findIndex((user) => user.id === splitInfo.paidById)

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <SplitForm
        initialTitle={splitInfo.title}
        initialEntries={initialEntries}
        initialPaidByIndex={initialPaidByIndex}
        initialTimestamp={splitInfo.timestamp}
        groupInfo={groupInfo}
        onSubmit={save}
        waiting={waiting}
        error={error}
      />
    </View>
  )
}

export default function Modal() {
  const { id, splitId } = useLocalSearchParams()
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: splitInfo } = useSplitInfo(Number(id), Number(splitId))

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.editSplit')} maxWidth={600}>
      {(!groupInfo || !splitInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {groupInfo && splitInfo && <Form groupInfo={groupInfo} splitInfo={splitInfo} />}
    </ModalScreen>
  )
}
