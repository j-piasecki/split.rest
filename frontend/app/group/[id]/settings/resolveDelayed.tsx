import { ConfirmationModal } from '@components/ConfirmationModal'
import ModalScreen from '@components/ModalScreen'
import { ParticipantsPicker } from '@components/ParticipantsPicker'
import { useSnack } from '@components/SnackBar'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useResolveAllDelayedSplits } from '@hooks/database/useResolveAllSplits'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo, Member } from 'shared'

function Form({ info, memberInfo }: { info: GroupUserInfo; memberInfo: Member }) {
  const router = useRouter()
  const selectedUsersRef = useRef<Member[]>([])
  const snack = useSnack()
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [error, setError] = useTranslatedError()
  const { t } = useTranslation()
  const { mutateAsync: resolveDelayedSplits, isPending } = useResolveAllDelayedSplits(info.id)
  const { showToast } = useLocalSearchParams()

  return (
    <View style={{ flex: 1 }}>
      <ConfirmationModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={async () => {
          try {
            setError(null)
            await resolveDelayedSplits({
              type: 'equally',
              members: selectedUsersRef.current.map((user) => ({
                id: user.id,
              })),
            })

            if (showToast !== 'false') {
              snack.show({ message: t('groupSettings.resolveAllDelayed.success') })
            }

            if (router.canGoBack()) {
              router.back()
            } else {
              router.replace(`/group/${info.id}/settings`)
            }
          } catch (e) {
            setError(e)
          }
        }}
        title={'groupSettings.resolveAllDelayed.confirmationText'}
        message={'groupSettings.resolveAllDelayed.confirmationMessage'}
        confirmText={'groupSettings.resolveAllDelayed.confirm'}
        confirmIcon='check'
        cancelText={'groupSettings.resolveAllDelayed.cancel'}
        cancelIcon='close'
      />
      <ParticipantsPicker
        user={memberInfo}
        groupInfo={info}
        buttonTitle={t('groupSettings.resolveAllDelayed.resolveButton')}
        buttonLeftIcon='check'
        buttonLoading={isPending}
        requiredPayer={false}
        error={error ?? undefined}
        onSubmit={(users) => {
          if (!info.permissions.canResolveAllDelayedSplitsAtOnce()) {
            alert(t('api.insufficientPermissions.group.resolveAllDelayedSplitsAtOnce'))
            return
          }

          selectedUsersRef.current = users
          setConfirmModalVisible(true)
        }}
      />
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: info } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.resolveDelayed')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      {info && memberInfo && <Form info={info} memberInfo={memberInfo} />}
    </ModalScreen>
  )
}
