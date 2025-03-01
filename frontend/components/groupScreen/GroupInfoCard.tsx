import { Icon } from '@components/Icon'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from 'shared'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
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
      <ShimmerPlaceholder argument={info} shimmerStyle={{ height: 44 }}>
        {(info) => (
          <Text
            style={{ fontSize: 32, color: theme.colors.onSurfaceVariant }}
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
        <ShimmerPlaceholder
          argument={info}
          style={{ flex: 1, paddingLeft: 32 }}
          shimmerStyle={{ height: 32 }}
        >
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
          gap: 12,
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
