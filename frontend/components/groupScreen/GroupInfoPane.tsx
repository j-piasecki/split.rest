import { ActionableSplitsPane } from './ActionableSplitsPane'
import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { GroupIcon } from '@components/GroupIcon'
import { Icon } from '@components/Icon'
import { FullPaneHeader } from '@components/Pane'
import { RoundIconButton } from '@components/RoundIconButton'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { CurrencyUtils } from 'shared'
import { GroupUserInfo } from 'shared'

function useHasSettingsAccess(info: GroupUserInfo | undefined) {
  const { user } = useAuth()
  return info && (info.isAdmin || info.owner === user?.id)
}

export function GroupInfoPane({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const router = useRouter()
  const hasSettingsAccess = useHasSettingsAccess(info)
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()

  return (
    <View style={[{ gap: 2 }, threeBarLayout && { height: '100%' }]}>
      <FullPaneHeader
        icon='group'
        title={t('tabs.group')}
        textLocation='start'
        adjustsFontSizeToFit
        style={{ marginBottom: 0 }}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {hasSettingsAccess && (
              <RoundIconButton
                icon='settings'
                color={theme.colors.secondary}
                onPress={() => router.navigate(`/group/${info?.id}/settings`)}
              />
            )}
            {info?.permissions?.canSeeGroupTrends?.() && (
              <RoundIconButton
                icon={'barChartAlt'}
                color={theme.colors.secondary}
                onPress={() => {
                  router.navigate(`/group/${info?.id}/trends`)
                }}
              />
            )}
          </View>
        }
      />

      <View
        style={[
          {
            backgroundColor: theme.colors.surfaceContainer,
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingBottom: !info?.locked || Platform.OS === 'web' ? 16 : undefined,
            borderRadius: 4,
            gap: 12,
          },
          !info?.locked && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
        ]}
      >
        <TitleWithBalance info={info} />

        {threeBarLayout && (
          <ButtonShimmer argument={info}>
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
        )}
      </View>

      {info?.locked && (
        <View
          style={[
            {
              backgroundColor: theme.colors.errorContainer,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 4,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            },
          ]}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name='lock' size={24} color={theme.colors.onErrorContainer} />
              <Text style={{ fontSize: 18, fontWeight: 700, color: theme.colors.onErrorContainer }}>
                {t('groupInfo.groupLocked')}
              </Text>
            </View>
            <Text
              style={{
                marginLeft: 32,
                fontSize: 15,
                fontWeight: 500,
                color: theme.colors.onErrorContainer,
              }}
            >
              {t('groupInfo.groupLockedDescription')}
            </Text>
          </View>
        </View>
      )}

      {threeBarLayout && <ActionableSplitsPane info={info} style={{ flex: 1, marginTop: 6 }} />}
    </View>
  )
}

function TitleWithBalance({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <>
      <ShimmerPlaceholder argument={info} shimmerStyle={{ height: 44 }}>
        {(info) => (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <GroupIcon info={info} size={44} />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 32, color: theme.colors.primary, fontWeight: '600' }}
                numberOfLines={3}
                adjustsFontSizeToFit
              >
                {info.name}
              </Text>
            </View>
          </View>
        )}
      </ShimmerPlaceholder>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 4, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>
          {t('groupInfo.yourBalance')}
        </Text>
        <ShimmerPlaceholder
          argument={info}
          style={{ flex: 1, paddingLeft: 32 }}
          shimmerStyle={{ height: 32 }}
        >
          {(info) => (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 30,
                fontWeight: '700',
                color: getBalanceColor(Number(info.balance), theme),
              }}
            >
              {CurrencyUtils.format(info.balance, info.currency, true, true)}
            </Text>
          )}
        </ShimmerPlaceholder>
      </View>
    </>
  )
}
