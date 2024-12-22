import { Button } from '@components/Button'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupInfo } from 'shared'

function InfoCard({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()

  return (
    <View
      style={{
        flex: threeBarLayout || displayClass > DisplayClass.Small ? 1 : undefined,
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceContainer,
        borderRadius: 16,
        gap: 8,
        paddingHorizontal: threeBarLayout ? 0 : 16,
        paddingTop: threeBarLayout ? 0 : 16,
        paddingBottom: threeBarLayout ? 0 : 24,
      }}
    >
      <Text style={{ fontSize: 32, color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        {info.name}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>
          {t('groupInfo.yourBalance')}
        </Text>
        <Text
          style={{
            fontSize: 24,
            color:
              Number(info.balance) === 0
                ? theme.colors.balanceNeutral
                : Number(info.balance) > 0
                  ? theme.colors.balancePositive
                  : theme.colors.balanceNegative,
          }}
        >
          {Number(info.balance) > 0 && '+'}
          {info.balance} <Text style={{ color: 'darkgray' }}>{info.currency}</Text>
        </Text>
      </View>

      <View
        style={{
          justifyContent: 'center',
          gap: 16,
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='members' size={20} color={theme.colors.outline} />
          </View>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
            {t('groupInfo.numberOfMembers', { count: info.memberCount })}
          </Text>
        </View>

        {!info.hasAccess && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <Icon name={'lock'} size={20} color={theme.colors.error} />
            </View>
            <Text
              style={{
                color: theme.colors.error,
                fontSize: 18,
              }}
            >
              {t('groupInfo.noAccessToGroup')}
            </Text>
          </View>
        )}

        {info.isAdmin && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <Icon name='shield' size={20} color={theme.colors.outline} />
            </View>
            <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
              {t('groupInfo.youAreAdmin')}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon name='money' size={20} color={theme.colors.outline} />
          </View>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
            {t('groupInfo.totalTransactionsValue', {
              value: info.total,
              currency: info.currency,
            })}
          </Text>
        </View>
      </View>
    </View>
  )
}

function ActionButtons({ info }: { info: GroupInfo }) {
  const user = useAuth()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info.id)

  return (
    <View style={{ flexDirection: 'column', gap: 12 }}>
      {info.hasAccess && (
        <Button
          onPress={() => {
            router.navigate(`/group/${info.id}/roulette`)
          }}
          title={t('groupInfo.roulette')}
          leftIcon='payments'
        />
      )}

      {permissions?.canCreateSplits() && (
        <Button
          onPress={() => {
            router.navigate(`/group/${info.id}/addSplit`)
          }}
          title={t('groupInfo.addSplit')}
          leftIcon='split'
        />
      )}

      {info.hidden && (
        <Button
          title={t('groupInfo.showGroup')}
          onPress={() => {
            setGroupHiddenMutation(false)
          }}
          leftIcon='visibility'
        />
      )}

      {info.hidden === false && (
        <Button
          title={t('groupInfo.hideGroup')}
          onPress={() => {
            setGroupHiddenMutation(true)
          }}
          leftIcon='visibilityOff'
        />
      )}

      {(info.isAdmin || info.owner === user?.id) && (
        <Button
          title={t('groupInfo.settings')}
          onPress={() => router.navigate(`/group/${info.id}/settings`)}
          leftIcon='settings'
        />
      )}
    </View>
  )
}

export function GroupInfoPage({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small

  if (!info) {
    return (
      <View
        style={{
          width: '100%',
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceContainer,
          marginBottom: 16,
          borderRadius: 16,
        }}
      >
        <ActivityIndicator color={theme.colors.onSurface} />
      </View>
    )
  }

  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        flexDirection: threeBarLayout || isSmallScreen ? 'column' : 'row',
        alignItems: threeBarLayout || isSmallScreen ? undefined : 'center',
        gap: 16,
      }}
    >
      <InfoCard info={info} />
      <ActionButtons info={info} />
    </View>
  )
}
