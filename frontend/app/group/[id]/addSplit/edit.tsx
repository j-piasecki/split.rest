import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { FormData } from '@components/SplitForm'
import { SplitEditForm } from '@components/SplitForm/SplitEditForm'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { HapticFeedback } from '@utils/hapticFeedback'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo, SplitMethod, SplitWithUsers } from 'shared'

function Content({ groupInfo, split }: { groupInfo: GroupUserInfo; split: SplitWithUsers }) {
  const router = useRouter()
  const snack = useSnack()
  const insets = useModalScreenInsets()
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useTranslatedError()
  const { t } = useTranslation()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange, timestamp } = await validateSplitForm(form)

      await SplitCreationContext.current.saveSplit({
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave.toFixed(2),
        timestamp: timestamp,
        balances: balanceChange,
        type: split.type,
        currency: groupInfo.currency,
      })

      HapticFeedback.confirm()
      snack.show({ message: t('split.created') })
      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
      HapticFeedback.reject()
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
      }}
    >
      <SplitEditForm
        splitMethod={SplitMethod.ExactAmounts}
        style={{
          paddingTop: insets.top + 16,
        }}
        groupInfo={groupInfo}
        splitInfo={split}
        onSubmit={save}
        error={error}
        showSuggestions={false}
        showAddAllMembers={false}
        cleanError={() => setError(null)}
        waiting={waiting}
      />
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const [split] = useState<SplitWithUsers>(SplitCreationContext.current.buildSplitPreview())

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.editSplit')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
    >
      {groupInfo && <Content groupInfo={groupInfo} split={split} />}
    </ModalScreen>
  )
}
