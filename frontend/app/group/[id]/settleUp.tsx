import { Button } from '@components/Button'
import Modal from '@components/ModalScreen'
import { SplitInfo } from '@components/SplitInfo'
import { useConfirmSettleUpMutation } from '@hooks/database/useConfirmSettleUpMutation'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSettleUpPreview } from '@hooks/database/useSettleUpPreview'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupUserInfo, isTranslatableError, SplitWithHashedChanges } from 'shared'

interface SettleUpPreviewProps {
  preview: SplitWithHashedChanges
  groupInfo: GroupUserInfo
}

function SettleUpPreview(props: SettleUpPreviewProps) {
  const insets = useModalScreenInsets()
  const router = useRouter()
  const { t } = useTranslation()
  const { mutateAsync: confirmSettleUp, isPending: isCompleting } = useConfirmSettleUpMutation(props.groupInfo.id)

  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(`/group/${props.groupInfo.id}`)
    }
  }

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
        splitInfo={props.preview}
        groupInfo={props.groupInfo}
        style={{ paddingTop: insets.top + 16 }}
        showCompleteButton={false}
      />
      <Button
        leftIcon='save'
        title={t('groupInfo.settleUp.confirm')}
        onPress={async () => {
          await confirmSettleUp(props.preview.entriesHash).then(() => {
            goBack()
          }).catch((error) => {
            if (isTranslatableError(error)) {
              alert(t(error.message, error.args))
            } else {
              alert(t('unknownError'))
            }
          })
        }}
        isLoading={isCompleting}
      />
      <Button
        leftIcon='close'
        title={t('groupInfo.settleUp.cancel')}
        onPress={goBack}
        destructive
        disabled={isCompleting}
      />
    </View>
  )
}

export default function SettleUp() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: settleUpPreview } = useSettleUpPreview(Number(id))
  const theme = useTheme()

  return (
    <Modal title={t('screenName.settleUp')} returnPath={`/group/${id}`} maxWidth={600}>
      {settleUpPreview && groupInfo ? (
        <SettleUpPreview preview={settleUpPreview} groupInfo={groupInfo} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.onSurface} />
        </View>
      )}
    </Modal>
  )
}
