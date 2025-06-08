import { Button } from '@components/Button'
import Modal from '@components/ModalScreen'
import { useSnack } from '@components/SnackBar'
import { SplitInfo } from '@components/SplitInfo'
import { useConfirmSettleUpMutation } from '@hooks/database/useConfirmSettleUpMutation'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSettleUpPreview } from '@hooks/database/useSettleUpPreview'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { invalidateGroup } from '@utils/queryClient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, SplitWithHashedChanges, isTranslatableError } from 'shared'

interface SettleUpPreviewProps {
  preview: SplitWithHashedChanges
  groupInfo: GroupUserInfo
  goBack: () => void
  withMembers?: string[]
}

function SettleUpPreview(props: SettleUpPreviewProps) {
  const insets = useModalScreenInsets()
  const snack = useSnack()
  const router = useRouter()
  const { t } = useTranslation()
  const { mutateAsync: confirmSettleUp, isPending: isCompleting } = useConfirmSettleUpMutation(
    props.groupInfo.id,
    props.withMembers
  )

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        gap: 8,
      }}
    >
      <SplitInfo
        splitHistory={[props.preview]}
        groupInfo={props.groupInfo}
        style={{ paddingTop: insets.top + 16 }}
        showCompleteButton={false}
      />
      <Button
        leftIcon='save'
        title={t('groupInfo.settleUp.confirm')}
        onPress={async () => {
          await confirmSettleUp(props.preview.entriesHash)
            .catch((error) => {
              if (isTranslatableError(error)) {
                alert(t(error.message, error.args))
                invalidateGroup(props.groupInfo.id)
              } else {
                alert(t('unknownError'))
              }
            })
            .then((split) => {
              snack.show({
                message: t('groupInfo.settleUp.settleUpSuccess'),
                actionText: t('groupInfo.settleUp.openSettleUp'),
                action: async () => {
                  router.navigate(`/group/${props.groupInfo.id}/split/${split!.id}`)
                },
              })
              props.goBack()
            })
        }}
        isLoading={isCompleting}
      />
      <Button
        leftIcon='close'
        title={t('groupInfo.settleUp.cancel')}
        onPress={props.goBack}
        destructive
        disabled={isCompleting}
      />
    </View>
  )
}

export default function SettleUp() {
  const { t } = useTranslation()
  const { id, withMembers: withMembersQuery } = useLocalSearchParams<{
    id: string
    withMembers?: string
  }>()

  const withMembers = withMembersQuery?.split(',')

  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: settleUpPreview, error: settleUpError } = useSettleUpPreview(
    Number(id),
    withMembers
  )
  const router = useRouter()
  const theme = useTheme()

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(`/group/${id}`)
    }
  }, [router, id])

  useEffect(() => {
    if (settleUpError) {
      if (isTranslatableError(settleUpError)) {
        alert(t(settleUpError.message, settleUpError.args))
        goBack()
      } else {
        alert(t('unknownError'))
      }
    }
  }, [settleUpError, t, goBack])

  return (
    <Modal title={t('screenName.settleUp')} returnPath={`/group/${id}`} maxWidth={600}>
      {settleUpPreview && groupInfo ? (
        <SettleUpPreview
          preview={settleUpPreview}
          groupInfo={groupInfo}
          goBack={goBack}
          withMembers={withMembers}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.onSurface} />
        </View>
      )}
    </Modal>
  )
}
