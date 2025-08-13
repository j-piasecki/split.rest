import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { ButtonWithSecondaryActions } from '@components/ButtonWithSecondaryActions'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { Icon } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader, Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useRemoveUserFromGroupMutation } from '@hooks/database/useRemoveUserFromGroup'
import { useSetUserDisplayNameMutation } from '@hooks/database/useSetUserDisplayName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { CurrencyUtils, GroupUserInfo, Member, SplitInfo, TranslatableError } from 'shared'

function RemoveMemberButton({
  groupInfo,
  memberInfo,
  isSelf,
  memberId,
  splits,
}: {
  groupInfo: GroupUserInfo
  memberInfo: Member
  isSelf: boolean
  memberId: string
  splits?: SplitInfo[]
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const { mutateAsync: removeMember } = useRemoveUserFromGroupMutation(groupInfo.id)
  const [modalVisible, setModalVisible] = useState(false)

  const isMemberOwner = memberId === groupInfo.owner

  async function onConfirm() {
    if (isMemberOwner) {
      throw new TranslatableError(
        isSelf ? 'memberInfo.youCannotLeaveAsOwner' : 'api.group.groupOwnerCannotBeRemoved'
      )
    }

    if (Number(memberInfo.balance) !== 0 || (splits && splits.length > 0)) {
      throw new TranslatableError(
        isSelf ? 'memberInfo.youAreAParticipantInSomeSplits' : 'api.group.userIsSplitParticipant'
      )
    }

    await removeMember(memberId).then(() => {
      if (isSelf) {
        router.dismissTo('/home')
      } else if (router.canGoBack()) {
        router.back()
      } else {
        router.dismissTo(`/group/${groupInfo.id}`)
      }
    })
  }

  return (
    <>
      <Button
        destructive
        leftIcon='personRemove'
        title={isSelf ? t('memberInfo.leaveGroup') : t('memberInfo.removeFromGroup')}
        onPress={() => setModalVisible(true)}
      />

      <ConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={onConfirm}
        title={
          isSelf
            ? 'memberInfo.leaveGroupConfirmationText'
            : 'memberInfo.removeFromGroupConfirmationText'
        }
        confirmText={isSelf ? 'memberInfo.leaveGroupConfirm' : 'memberInfo.removeFromGroupConfirm'}
        cancelText='memberInfo.cancel'
        cancelIcon='close'
        confirmIcon='personRemove'
        destructive
      />
    </>
  )
}

function DisplayNameSetter({
  groupInfo,
  memberInfo,
}: {
  groupInfo: GroupUserInfo
  memberInfo: Member
}) {
  const theme = useTheme()
  const user = useAuth()
  const { t } = useTranslation()
  const { mutateAsync: setDisplayName, isPending: isChangingDisplayName } =
    useSetUserDisplayNameMutation(groupInfo.id, memberInfo.id)
  const [value, setValue] = useState(memberInfo.displayName)

  const canEditDisplayName =
    groupInfo?.permissions?.canChangeEveryoneDisplayName?.() ||
    (groupInfo?.permissions?.canChangeDisplayName?.() && user?.id === memberInfo.id)

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <LargeTextInput
        placeholder={t('memberInfo.displayNamePlaceholder')}
        disabled={!canEditDisplayName || isChangingDisplayName}
        value={value ?? ''}
        onChangeText={setValue}
        containerStyle={{ paddingRight: 56 }}
      />
      <View
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {canEditDisplayName && value?.length && (
          <RoundIconButton
            color={theme.colors.secondary}
            icon='check'
            onPress={() => setDisplayName(value)}
            size={32}
            isLoading={isChangingDisplayName}
            disabled={value === memberInfo.displayName}
          />
        )}
      </View>
    </View>
  )
}

export function MemberInfo({
  groupInfo,
  memberInfo,
  splits,
}: {
  groupInfo?: GroupUserInfo
  memberInfo?: Member
  splits?: SplitInfo[]
}) {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()

  return (
    <View
      style={{
        flex: 1,
        gap: 12,
      }}
    >
      <Pane icon='user' title={t('memberInfo.details')} textLocation='start'>
        <View style={{ padding: 12, gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ShimmerPlaceholder
              argument={memberInfo}
              style={{ width: 96, height: 96 }}
              shimmerStyle={{ borderRadius: 64 }}
            >
              {(memberInfo) => <ProfilePicture userId={memberInfo.id} size={96} />}
            </ShimmerPlaceholder>

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View>
                <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 28 }}>
                  {(memberInfo) => (
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: theme.colors.onSurface,
                      }}
                    >
                      {memberInfo.name}
                    </Text>
                  )}
                </ShimmerPlaceholder>
                <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 22 }}>
                  {(memberInfo) => (
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {memberInfo.email}
                    </Text>
                  )}
                </ShimmerPlaceholder>
              </View>

              <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 28 }}>
                {(memberInfo) => (
                  <Text style={{ fontSize: 22, fontWeight: 500, color: theme.colors.onSurface }}>
                    <Trans
                      values={{
                        balance: CurrencyUtils.format(memberInfo.balance, groupInfo?.currency),
                      }}
                      i18nKey={'memberInfo.balance'}
                      components={{
                        Styled: (
                          <Text
                            style={{
                              fontWeight: 600,
                              color: getBalanceColor(Number(memberInfo.balance), theme),
                            }}
                          />
                        ),
                      }}
                    />
                  </Text>
                )}
              </ShimmerPlaceholder>
            </View>
          </View>

          {memberInfo && (!memberInfo.hasAccess || memberInfo.isAdmin) && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
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
        </View>
      </Pane>

      <ShimmerPlaceholder
        argument={groupInfo && memberInfo}
        shimmerStyle={{ width: '100%', height: 72 }}
      >
        <DisplayNameSetter groupInfo={groupInfo!} memberInfo={memberInfo!} />
      </ShimmerPlaceholder>

      <View style={{ gap: 8 }}>
        {memberId !== user?.id && (
          <ButtonShimmer argument={groupInfo && memberInfo}>
            {() =>
              groupInfo?.permissions?.canSettleUp?.() &&
              (Number(groupInfo?.balance) !== 0 || Number(memberInfo?.balance) !== 0) && (
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
              )
            }
          </ButtonShimmer>
        )}

        {groupInfo &&
          memberInfo &&
          (memberId === user?.id || groupInfo?.permissions?.canRemoveMembers?.()) && (
            <RemoveMemberButton
              groupInfo={groupInfo}
              memberInfo={memberInfo}
              isSelf={memberId === user?.id}
              memberId={memberId as string}
              splits={splits}
            />
          )}
      </View>
    </View>
  )
}

function MemberScreen({
  groupInfo,
  memberInfo,
}: {
  groupInfo?: GroupUserInfo
  memberInfo?: Member
}) {
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()

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
        <View style={{ gap: 12, paddingTop: 16 }}>
          <MemberInfo groupInfo={groupInfo} memberInfo={memberInfo} splits={splits} />
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
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 16,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
      }}
    >
      <MemberInfo groupInfo={groupInfo} memberInfo={memberInfo} />
    </View>
  )
}

function MemberInfoError({ groupInfo }: { groupInfo?: GroupUserInfo }) {
  const { t } = useTranslation()
  const theme = useTheme()

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

export default function MemberInfoScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(groupId))
  const { data: memberInfo, error } = useGroupMemberInfo(Number(groupId), String(memberId))

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
      {error || groupInfo?.permissions?.canReadMembers?.() === false ? (
        <MemberInfoError groupInfo={groupInfo} />
      ) : (
        <MemberScreen groupInfo={groupInfo} memberInfo={memberInfo} />
      )}
    </ModalScreen>
  )
}
