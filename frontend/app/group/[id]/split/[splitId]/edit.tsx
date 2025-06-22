import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { FormData } from '@components/SplitForm'
import { SplitEditForm } from '@components/SplitForm/SplitEditForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSplitInfo } from '@hooks/database/useSplitInfo'
import { useUpdateSplit } from '@hooks/database/useUpdateSplit'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { BalanceChange, GroupUserInfo, SplitType, SplitWithUsers } from 'shared'

function Form({ groupInfo, splitInfo }: { groupInfo: GroupUserInfo; splitInfo: SplitWithUsers }) {
  const router = useRouter()
  const snack = useSnack()
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)
  const { t } = useTranslation()
  const { mutateAsync: updateSplit } = useUpdateSplit()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange, timestamp } = await (splitInfo.type ===
      SplitType.BalanceChange
        ? validateSplitForm(form, false, false)
        : validateSplitForm(form))

      await updateSplit({
        splitId: splitInfo.id,
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave,
        timestamp: timestamp,
        balances: balanceChange as BalanceChange[],
      })

      snack.show({ message: t('split.updated') })
      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}
    >
      <SplitEditForm
        style={{
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
        splitInfo={splitInfo}
        groupInfo={groupInfo}
        onSubmit={save}
        waiting={waiting}
        error={error}
        cleanError={() => setError(null)}
        showPayerSelector={splitInfo.type !== SplitType.BalanceChange}
        showPaidByHint={splitInfo.type !== SplitType.BalanceChange}
        showAddAllMembers={false}
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
