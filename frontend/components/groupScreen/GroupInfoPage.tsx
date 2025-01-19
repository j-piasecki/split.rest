import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { Icon } from '@components/Icon'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { beginNewSplit } from '@utils/splitCreationContext'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export function GroupInfoCard({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()

  return (
    <View
      style={{
        flex: threeBarLayout || displayClass > DisplayClass.Small ? 1 : undefined,
        justifyContent: 'center',
        borderRadius: 16,
        gap: 8,
      }}
    >
      <ShimmerPlaceholder argument={info} shimmerStyle={{ height: 44, marginBottom: 8 }}>
        {(info) => (
          <Text
            style={{ fontSize: 32, color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            numberOfLines={3}
            adjustsFontSizeToFit
          >
            {info.name}
          </Text>
        )}
      </ShimmerPlaceholder>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>
          {t('groupInfo.yourBalance')}
        </Text>
        <ShimmerPlaceholder argument={info} style={{ flex: 1 }} shimmerStyle={{ height: 32 }}>
          {(info) => (
            <Text
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 24,
                color:
                  Number(info.balance) === 0
                    ? theme.colors.balanceNeutral
                    : Number(info.balance) > 0
                      ? theme.colors.balancePositive
                      : theme.colors.balanceNegative,
              }}
            >
              {CurrencyUtils.format(info.balance, info.currency, true)}
            </Text>
          )}
        </ShimmerPlaceholder>
      </View>

      <View
        style={{
          justifyContent: 'center',
          gap: 16,
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='members' size={20} color={theme.colors.outline} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.outline, fontSize: 18, flex: 1 }}>
                {t('groupInfo.numberOfMembers', { count: info.memberCount })}
              </Text>
            )}
          </ShimmerPlaceholder>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='money' size={20} color={theme.colors.outline} />
          </View>
          <ShimmerPlaceholder
            argument={info}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            shimmerStyle={{ height: 24 }}
          >
            {(info) => (
              <Text style={{ color: theme.colors.outline, fontSize: 18, flex: 1 }}>
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
                  <Icon name='shield' size={20} color={theme.colors.outline} />
                </View>
                <Text style={{ color: theme.colors.outline, fontSize: 18, flex: 1 }}>
                  {t('groupInfo.youAreAdmin')}
                </Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </View>
  )
}

export function GroupActionButtons({ info }: { info: GroupUserInfo | undefined }) {
  const user = useAuth()

  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info?.id)

  return (
    <View style={{ flexDirection: 'column', gap: 12 }}>
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

      <ButtonShimmer argument={permissions} offset={-0.05}>
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

      <ButtonShimmer argument={info} offset={-0.1}>
        {(info) =>
          info.hidden ? (
            <Button
              title={t('groupInfo.showGroup')}
              onPress={() => {
                setGroupHiddenMutation(false)
              }}
              leftIcon='visibility'
            />
          ) : (
            <Button
              title={t('groupInfo.hideGroup')}
              onPress={() => {
                setGroupHiddenMutation(true)
              }}
              leftIcon='visibilityOff'
            />
          )
        }
      </ButtonShimmer>

      {info && (info.isAdmin || info.owner === user?.id) && (
        <Button
          title={t('groupInfo.settings')}
          onPress={() => router.navigate(`/group/${info.id}/settings`)}
          leftIcon='settings'
        />
      )}
    </View>
  )
}
