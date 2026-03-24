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
import { useAppLayout } from '@utils/dimensionUtils'
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
  const appLayout = useAppLayout()
  const hasSettingsAccess = useHasSettingsAccess(info)
  const { threePaneLayout } = useAppLayout()
  const { t } = useTranslation()
  const isNarrow = appLayout.narrowGroupPane

  return (
    <View style={[{ gap: 2 }, threePaneLayout.enabled && { height: '100%' }]}>
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
            paddingHorizontal: 8,
            paddingTop: 8,
            paddingBottom: !info?.locked ? 12 : undefined,
            borderRadius: 4,
            justifyContent: 'flex-end',
          },
          !info?.locked && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
        ]}
      >
        {!isNarrow ? (
          <View
            style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingHorizontal: 8 }}
          >
            <View style={{ flex: 1 }}>
              <GroupHeader info={info} />
            </View>
            <View style={{ flex: 1 }}>
              <GroupBalance info={info} />
            </View>
          </View>
        ) : (
          <GroupHeader info={info} />
        )}

        <View style={{ paddingHorizontal: 4 }}>
          {isNarrow && <GroupBalance info={info} />}

          <ButtonShimmer argument={info}>
            {(info) =>
              Number(info?.balance) !== 0 &&
              info.permissions.canSettleUp?.() && (
                <Button
                  onPress={() => {
                    if (info.permissions.canSettleUpGroup()) {
                      router.navigate(`/group/${info!.id}/settleUp`)
                    } else {
                      router.navigate(`/group/${info!.id}/settleUp/confirm`)
                    }
                  }}
                  title={t('groupInfo.settleUp.settleUp')}
                  leftIcon='balance'
                />
              )
            }
          </ButtonShimmer>
        </View>
      </View>

      {info?.locked && (
        <View
          style={[
            {
              backgroundColor: theme.colors.errorContainer,
              paddingHorizontal: 12,
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

      {threePaneLayout.enabled && (
        <ActionableSplitsPane info={info} style={{ flex: 1, marginTop: 6 }} />
      )}
    </View>
  )
}

function GroupHeader({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <GroupIcon info={info} size={48} />
      <View style={{ flex: 1 }}>
        <ShimmerPlaceholder argument={info} shimmerStyle={{ height: 36 }}>
          {(info) => (
            <Text
              style={{ fontSize: 32, color: theme.colors.primary, fontWeight: '600' }}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {info.name}
            </Text>
          )}
        </ShimmerPlaceholder>
      </View>
    </View>
  )
}

function GroupBalance({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <View style={{ flexDirection: 'row', gap: 32, alignItems: 'baseline' }}>
      <View style={{ flex: 2, flexDirection: 'column-reverse' }}>
        <ShimmerPlaceholder
          argument={info}
          shimmerStyle={{ height: 54, marginBottom: 14, marginTop: 8 }}
        >
          {(info) => (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                fontSize: 56,
                fontWeight: 700,
                paddingLeft: Number(info.balance) === 0 ? 12 : 0,
                color: getBalanceColor(Number(info.balance), theme),
              }}
            >
              {CurrencyUtils.format(info.balance, info.currency, true, true)}
            </Text>
          )}
        </ShimmerPlaceholder>
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
            fontWeight: 700,
            transform: [{ translateY: 4 }],
          }}
        >
          {t('groupInfo.yourBalance')}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'column-reverse',
          justifyContent: 'flex-start',
          alignSelf: Platform.OS === 'web' ? 'flex-end' : undefined,
          paddingBottom: Platform.OS === 'web' ? 8 : undefined,
        }}
      >
        <ShimmerPlaceholder argument={info} shimmerStyle={{ height: 30 }}>
          {(info) => (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {CurrencyUtils.format(info.total, info.currency)}
            </Text>
          )}
        </ShimmerPlaceholder>
        <Text style={{ flexGrow: 0, fontSize: 12, color: theme.colors.outline, fontWeight: 700 }}>
          {t('groupInfo.groupTotal')}
        </Text>
      </View>
    </View>
  )
}
