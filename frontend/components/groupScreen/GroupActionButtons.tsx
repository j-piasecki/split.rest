import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { useSnack } from '@components/SnackBar'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSettleUp } from '@hooks/database/useSettleUp'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { beginNewSplit } from '@utils/splitCreationContext'
import { router, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

interface SettleUpModalProps {
  visible: boolean
  groupInfo: GroupUserInfo | undefined
  onClose: () => void
}

function SettleUpModal({ visible, groupInfo, onClose }: SettleUpModalProps) {
  const snack = useSnack()
  const router = useRouter()
  const { t } = useTranslation()
  const { mutateAsync: settleUp } = useSettleUp()

  return (
    <ConfirmationModal
      visible={visible}
      title='groupInfo.settleUp.doYouWantToSettleUp'
      message='groupInfo.settleUp.settleUpDescription'
      confirmText='groupInfo.settleUp.settleUp'
      confirmIcon='balance'
      cancelText='groupInfo.settleUp.cancel'
      cancelIcon='close'
      onConfirm={async () => {
        try {
          const settleUpSplit = await settleUp(groupInfo?.id)
          snack.show({ message: t('groupInfo.settleUp.settleUpSuccess') })

          // delay navigation a bit to allow the snackbar to show, otherwise animation breaks
          setTimeout(() => {
            router.navigate(`/group/${groupInfo?.id}/split/${settleUpSplit.id}`)
          }, 50)
        } catch {
          alert(t('api.auth.tryAgain'))
        }
      }}
      onClose={onClose}
    />
  )
}

export function GroupActionButtons({ info }: { info: GroupUserInfo | undefined }) {
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const [settleUpModalVisible, setSettleUpModalVisible] = useState(false)

  let shimmerOffset = 0

  return (
    <View style={{ flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
      <SettleUpModal
        visible={settleUpModalVisible}
        groupInfo={info}
        onClose={() => setSettleUpModalVisible(false)}
      />

      <ButtonShimmer argument={permissions}>
        {(permissions) =>
          permissions.canAccessRoulette() && (
            <Button
              onPress={() => {
                router.navigate(`/group/${info!.id}/roulette`)
              }}
              title={t('groupInfo.roulette')}
              leftIcon='payments'
            />
          )
        }
      </ButtonShimmer>

      {!isSmallScreen && (
        <ButtonShimmer argument={permissions} offset={(shimmerOffset -= 0.05)}>
          {(permissions) =>
            permissions.canCreateSplits() && (
              <Button
                onPress={() => {
                  beginNewSplit()
                  router.navigate(`/group/${info!.id}/addSplit`)
                }}
                title={t('groupInfo.addSplit')}
                leftIcon='split'
              />
            )
          }
        </ButtonShimmer>
      )}

      <ButtonShimmer argument={permissions} offset={(shimmerOffset -= 0.05)}>
        {(permissions) =>
          Number(info?.balance) !== 0 &&
          permissions.canSettleUp() && (
            <Button
              onPress={() => {
                setSettleUpModalVisible(true)
              }}
              title={t('groupInfo.settleUp.settleUp')}
              leftIcon='balance'
            />
          )
        }
      </ButtonShimmer>
    </View>
  )
}
