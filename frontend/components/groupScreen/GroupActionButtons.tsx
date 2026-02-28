import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { useTheme } from '@styling/theme'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export function GroupActionButtons({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()

  let shimmerOffset = 0

  if (info?.locked && Number(info.balance) === 0) {
    return null
  }

  return (
    <View
      style={{
        flexGrow: 1,
        flexShrink: 1,
        backgroundColor: theme.colors.surfaceContainer,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 4,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <ButtonShimmer argument={info} offset={(shimmerOffset -= 0.05)}>
        {(info) =>
          Number(info?.balance) !== 0 &&
          info.permissions.canSettleUp?.() && (
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
