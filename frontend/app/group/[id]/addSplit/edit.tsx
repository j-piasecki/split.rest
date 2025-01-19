import ModalScreen from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { FormData } from '@components/SplitForm'
import { SplitEditForm } from '@components/SplitForm/SplitEditForm'
import { useCreateSplit } from '@hooks/database/useCreateSplit'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { getSplitCreationContext } from '@utils/splitCreationContext'
import { validateSplitForm } from '@utils/validateSplitForm'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo, SplitWithUsers } from 'shared'

function Content({ groupInfo, split }: { groupInfo: GroupUserInfo; split: SplitWithUsers }) {
  const router = useRouter()
  const snack = useSnack()
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useTranslatedError()
  const { t } = useTranslation()
  const { mutateAsync: createSplit } = useCreateSplit()

  async function save(form: FormData) {
    try {
      setWaiting(true)
      const { payerId, sumToSave, balanceChange, timestamp } = await validateSplitForm(form)

      await createSplit({
        groupId: groupInfo.id,
        paidBy: payerId,
        title: form.title,
        total: sumToSave.toFixed(2),
        timestamp: timestamp,
        balances: balanceChange,
      })

      snack.show(t('split.created'))
      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (error) {
      setError(error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <SplitEditForm
        groupInfo={groupInfo}
        splitInfo={split}
        onSubmit={save}
        error={error}
        waiting={waiting}
      />
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const [split] = useState<SplitWithUsers>(getSplitCreationContext().buildSplitPreview())

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.editSplit')}
      maxWidth={500}
      opaque={false}
    >
      {groupInfo && <Content groupInfo={groupInfo} split={split} />}
    </ModalScreen>
  )
}
