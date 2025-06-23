import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export function GroupActionButtons({ info }: { info: GroupUserInfo | undefined }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)

  let shimmerOffset = 0

  return (
    <View style={{ flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
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

      <ButtonShimmer argument={permissions} offset={(shimmerOffset -= 0.05)}>
        {(permissions) =>
          Number(info?.balance) !== 0 &&
          permissions.canSettleUp() && (
            <Button
              onPress={() => {
                router.navigate(`/group/${info!.id}/settleUp`)
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
