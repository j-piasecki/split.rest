import { ActionableSplitsPane } from './ActionableSplitsPane'
import { GroupActionButtons } from './GroupActionButtons'
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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { CurrencyUtils } from 'shared'
import { GroupUserInfo } from 'shared'

function useHasSettingsAccess(info: GroupUserInfo | undefined) {
  const user = useAuth()
  return info && (info.isAdmin || info.owner === user?.id)
}

export function GroupInfoPane({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const router = useRouter()
  const hasSettingsAccess = useHasSettingsAccess(info)
  const threeBarLayout = useThreeBarLayout()
  const [collapsed, setCollapsed] = useState(!threeBarLayout)
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
            {!threeBarLayout && (
              <RoundIconButton
                icon={collapsed ? 'arrowDown' : 'arrowUp'}
                color={theme.colors.secondary}
                onPress={() => setCollapsed(!collapsed)}
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
            paddingBottom: collapsed && !info?.locked ? 16 : undefined,
            borderRadius: 4,
          },
          collapsed && !info?.locked && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
        ]}
      >
        <TitleWithBalance info={info} />
      </View>

      {info?.locked && (
        <View
          style={[
            {
              backgroundColor: theme.colors.errorContainer,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 4,
            },
            !threeBarLayout &&
              collapsed && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
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

      {!collapsed && (
        <View
          style={[
            {
              backgroundColor: theme.colors.surfaceContainer,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 4,
              paddingBottom: threeBarLayout ? undefined : 16,
            },
            (!threeBarLayout || (info?.locked && Number(info.balance) === 0)) && {
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            },
            Platform.OS === 'web' &&
              info?.locked &&
              Number(info.balance) === 0 && {
                flexGrow: 1,
              },
          ]}
        >
          <GroupDetails info={info} />
        </View>
      )}

      {threeBarLayout && (
        <>
          <GroupActionButtons info={info} />
          <ActionableSplitsPane info={info} style={{ flexGrow: 100, marginTop: 6 }} />
        </>
      )}
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
          <Text
            style={{ fontSize: 32, color: theme.colors.primary, fontWeight: '600' }}
            numberOfLines={3}
            adjustsFontSizeToFit
          >
            {info.name}
          </Text>
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

function GroupDetails({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <>
      <View
        style={{
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='members' size={20} color={theme.colors.secondary} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                {t('groupInfo.numberOfMembers', { count: info.memberCount })}
              </Text>
            )}
          </ShimmerPlaceholder>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='money' size={20} color={theme.colors.secondary} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                {t('groupInfo.totalTransactionsValue', {
                  value: CurrencyUtils.format(info.total, info.currency),
                })}
              </Text>
            )}
          </ShimmerPlaceholder>
        </View>

        {info && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {!info.hasAccess ? (
              <>
                <View style={{ width: 24, alignItems: 'center' }}>
                  <Icon name={'lock'} size={20} color={theme.colors.error} />
                </View>
                <Text
                  style={{
                    color: theme.colors.error,
                    fontSize: 18,
                    flex: 1,
                  }}
                >
                  {t('groupInfo.noAccessToGroup')}
                </Text>
              </>
            ) : info.isAdmin ? (
              <>
                <View style={{ width: 24, alignItems: 'center' }}>
                  <Icon name='shield' size={20} color={theme.colors.secondary} />
                </View>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, flex: 1 }}>
                  {t('groupInfo.youAreAdmin')}
                </Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </>
  )
}
