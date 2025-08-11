import { ButtonWithSecondaryActions } from '@components/ButtonWithSecondaryActions'
import { EditableText } from '@components/EditableText'
import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSetUserDisplayNameMutation } from '@hooks/database/useSetUserDisplayName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { CurrencyUtils, isTranslatableError } from 'shared'

export function MemberInfo() {
  const user = useAuth()
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const router = useRouter()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(groupId))
  const { data: memberInfo, error } = useGroupMemberInfo(Number(groupId), String(memberId))

  const { mutateAsync: setDisplayName, isPending: isChangingDisplayName } =
    useSetUserDisplayNameMutation(Number(groupId), String(memberId))

  const canEditDisplayName =
    groupInfo?.permissions?.canChangeEveryoneDisplayName?.() ||
    (groupInfo?.permissions?.canChangeDisplayName?.() && user?.id === memberId)

  if (error || groupInfo?.permissions?.canReadMembers?.() === false) {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          {groupInfo?.permissions?.canReadMembers?.() ? (
            <>
              <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
              <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
                {t('api.group.userNotInGroup')}
              </Text>
            </>
          ) : (
            <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
              {t('api.insufficientPermissions.group.readMembers')}
            </Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          alignItems: 'center',
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 8, width: '100%' }}>
          <ShimmerPlaceholder
            argument={memberInfo}
            style={{ width: 128, height: 128 }}
            shimmerStyle={{ borderRadius: 64 }}
          >
            {(memberInfo) => <ProfilePicture userId={memberInfo.id} size={128} />}
          </ShimmerPlaceholder>
          <ShimmerPlaceholder
            argument={memberInfo}
            style={{ width: '100%', alignItems: 'center' }}
            shimmerStyle={{ width: 200, height: 32 }}
          >
            {(memberInfo) => (
              <EditableText
                value={memberInfo.displayName ?? memberInfo.name}
                placeholder={t('memberInfo.displayNamePlaceholder')}
                isPending={isChangingDisplayName}
                disabled={!canEditDisplayName}
                onSubmit={(name) => {
                  let newName: string | null = name.trim()
                  if (newName === memberInfo.name) {
                    newName = null
                  }
                  setDisplayName(newName).catch((e) => {
                    if (isTranslatableError(e)) {
                      alert(t(e.message, e.args))
                    }
                  })
                }}
                style={{ alignSelf: 'stretch', justifyContent: 'center' }}
                textStyle={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  textAlign: 'center',
                }}
              />
            )}
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 22 }}>
            {(memberInfo) =>
              memberInfo.displayName && (
                <Text
                  style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}
                >
                  {memberInfo.name}
                </Text>
              )
            }
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 22 }}>
            {(memberInfo) => (
              <Text
                style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}
              >
                {memberInfo.email}
              </Text>
            )}
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 28 }}>
            {(memberInfo) => (
              <Text style={{ fontSize: 22, fontWeight: '500', color: theme.colors.onSurface }}>
                <Trans
                  values={{
                    balance: CurrencyUtils.format(memberInfo.balance, groupInfo?.currency),
                  }}
                  i18nKey={'memberInfo.balance'}
                  components={{
                    Styled: (
                      <Text
                        style={{
                          fontWeight: '600',
                          color: getBalanceColor(Number(memberInfo.balance), theme),
                        }}
                      />
                    ),
                  }}
                />
              </Text>
            )}
          </ShimmerPlaceholder>

          {memberInfo && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 16,
              }}
            >
              {!memberInfo.hasAccess ? (
                <>
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Icon name={'lock'} size={20} color={theme.colors.error} />
                  </View>
                  <Text
                    style={{
                      color: theme.colors.error,
                      fontSize: 18,
                    }}
                  >
                    {t('memberInfo.noAccess')}
                  </Text>
                </>
              ) : memberInfo.isAdmin ? (
                <>
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Icon name='shield' size={20} color={theme.colors.onSurface} />
                  </View>
                  <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
                    {t('memberInfo.admin')}
                  </Text>
                </>
              ) : null}
            </View>
          )}

          {groupInfo?.permissions?.canSettleUp?.() &&
            memberId !== user?.id &&
            Number(groupInfo?.balance) !== 0 && (
              <View style={{ width: '100%' }}>
                <ButtonWithSecondaryActions
                  leftIcon='balance'
                  title={t('memberInfo.settleUpWithMember')}
                  onPress={() => {
                    router.navigate(`/group/${groupId}/settleUp?withMembers=${memberId}`)
                  }}
                  secondaryActions={[
                    {
                      label: t('memberInfo.settleUpWithMemberExactAmount'),
                      icon: 'exactAmount',
                      onPress: () => {
                        router.navigate(`/group/${groupId}/member/${memberId}/settleUpExactAmount`)
                      },
                    },
                  ]}
                />
              </View>
            )}
        </View>
      </View>
    </View>
  )
}

function MemberScreen() {
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(groupId))
  const { splits, isLoading, fetchNextPage, isFetchingNextPage, isRefetching, hasNextPage } =
    useGroupSplitsQuery(Number(groupId), {
      participants: { type: 'oneOf', ids: [String(memberId)] },
      targetUser: String(memberId),
    })

  return groupInfo?.permissions?.canQuerySplits?.() ? (
    <SplitsList
      info={groupInfo}
      splits={splits}
      isLoading={isLoading}
      isRefetching={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      hideFab
      hideBottomBar
      emptyMessage={t('memberInfo.noSplits')}
      headerComponent={
        <View style={{ gap: 24 }}>
          <MemberInfo />
          <FullPaneHeader
            icon='receipt'
            title={t('tabs.splits')}
            textLocation='start'
            adjustsFontSizeToFit
          />
        </View>
      }
    />
  ) : (
    <MemberInfo />
  )
}

export default function MemberInfoScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.memberInfo')}
      maxWidth={500}
      maxHeight={600}
    >
      <MemberScreen />
    </ModalScreen>
  )
}
