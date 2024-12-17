import { Button } from '@components/Button'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupInfo } from 'shared'

function InfoCard({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()

  return (
    <View
      style={{
        width: '100%',
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <Icon
              name={info.hasAccess ? 'lockOpen' : 'lock'}
              size={20}
              color={theme.colors.outline}
            />
          </View>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
            {info.hasAccess ? t('groupInfo.accessToGroup') : t('groupInfo.noAccessToGroup')}
          </Text>
        </View>

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
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info.id)

  return (
    <View style={{ marginVertical: 16, flexDirection: 'column', gap: 12 }}>
      {info.isAdmin && (
        <Button
          onPress={() => {
            router.navigate(`/group/${info.id}/addUser`)
          }}
          title={t('groupInfo.addUser')}
          leftIcon='addMember'
        />
      )}

      {info.hasAccess && (
        <Button
          onPress={() => {
            router.navigate(`/group/${info.id}/roulette`)
          }}
          title={t('groupInfo.roulette')}
          leftIcon='payments'
        />
      )}

      {info.hasAccess && (
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

  if (!info) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.onSurface} />
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        width: '100%',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 16,
        paddingBottom: 32,
        maxWidth: 550,
        alignSelf: 'center',
      }}
    >
      <InfoCard info={info} />
      <ActionButtons info={info} />
    </ScrollView>
  )
}
