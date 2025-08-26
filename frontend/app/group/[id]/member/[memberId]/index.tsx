import { ButtonShimmer } from '@components/ButtonShimmer'
import { ButtonWithSecondaryActions } from '@components/ButtonWithSecondaryActions'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { Icon, IconName } from '@components/Icon'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { FullPaneHeader, Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useRemoveUserFromGroupMutation } from '@hooks/database/useRemoveUserFromGroup'
import { useSetUserDisplayNameMutation } from '@hooks/database/useSetUserDisplayName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { buttonCornerSpringConfig, buttonPaddingSpringConfig } from '@styling/animationConfigs'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import {
  CurrencyUtils,
  GroupUserInfo,
  Member,
  SplitInfo,
  TranslatableError,
  isTranslatableError,
} from 'shared'

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

  function saveDisplayName() {
    if (value === null || value === memberInfo.displayName) {
      return
    }

    if (value.length === 0) {
      alert(t('api.user.nameCannotBeEmpty'))
      return
    }

    if (value.length > 128) {
      alert(t('api.user.nameTooLong'))
      return
    }

    setDisplayName(value)
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <LargeTextInput
        placeholder={t('memberInfo.displayNamePlaceholder')}
        disabled={!canEditDisplayName || isChangingDisplayName}
        value={value ?? ''}
        onChangeText={setValue}
        containerStyle={{ flex: 1, paddingRight: 56 }}
        onSubmit={saveDisplayName}
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
        {canEditDisplayName && value !== null && value !== (memberInfo.displayName ?? '') && (
          <RoundIconButton
            opaque
            color={theme.colors.secondary}
            icon='saveAlt'
            onPress={saveDisplayName}
            size={32}
            isLoading={isChangingDisplayName}
          />
        )}
      </View>
    </View>
  )
}

function MemberActionButton({
  icon,
  title,
  onPress,
  color,
  destructive,
  disabled,
  horizontal,
}: {
  icon: IconName
  title: string
  onPress: () => Promise<void>
  color?: string
  destructive?: boolean
  disabled?: boolean
  horizontal?: boolean
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isSmallScreen = useDisplayClass() <= DisplayClass.Small
  const foregroundColor =
    color ?? (destructive ? theme.colors.onErrorContainer : theme.colors.secondary)
  const backgroundColor = destructive ? theme.colors.errorContainer : theme.colors.surfaceContainer
  const iconSize = horizontal ? 24 : isSmallScreen ? 28 : 24
  const iconContainerSize = horizontal ? 48 : isSmallScreen ? 48 : 32

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderRadius: withSpring(isPressed ? 24 : 12, buttonCornerSpringConfig),
      transform: [{ scaleX: withSpring(isPressed ? 1.05 : 1, buttonPaddingSpringConfig) }],
    }
  })

  const innerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: withSpring(isPressed ? 1 / 1.05 : 1, buttonPaddingSpringConfig) }],
    }
  })

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          flex: 1,
          backgroundColor: backgroundColor,
          borderRadius: 12,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: `${theme.colors.onSurface}`,
            opacity: isPressed ? 0.1 : isHovered ? 0.05 : 0,
          },
        ]}
      />
      <Pressable
        onPress={() => {
          setIsLoading(true)
          onPress()
            .catch((e) => {
              if (isTranslatableError(e)) {
                alert(t(e.message))
              } else {
                alert(t('unknownError'))
              }
            })
            .finally(() => {
              setIsLoading(false)
            })
        }}
        disabled={disabled}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={{
          flex: 1,
        }}
      >
        <Animated.View
          style={[
            innerAnimatedStyle,
            {
              flex: 1,
              alignItems: 'center',
              flexDirection: horizontal ? 'row' : 'column',
              gap: 4,
              paddingVertical: 8,
              paddingHorizontal: 12,
            },
          ]}
        >
          <View
            style={{
              width: iconContainerSize,
              height: iconContainerSize,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator size='small' color={foregroundColor} />
            ) : (
              <Icon name={icon} size={iconSize} color={foregroundColor} />
            )}
          </View>
          <View
            style={{
              flex: horizontal ? undefined : 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: horizontal ? 20 : 16,
                color: foregroundColor,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {title}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

function RemoveMemberButton({
  groupInfo,
  memberInfo,
  isSelf,
  memberId,
  splits,
  disabled,
  horizontal,
}: {
  groupInfo: GroupUserInfo
  memberInfo: Member
  isSelf: boolean
  memberId: string
  splits?: SplitInfo[]
  disabled?: boolean
  horizontal?: boolean
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const { mutateAsync: removeMember } = useRemoveUserFromGroupMutation(groupInfo.id)
  const [modalVisible, setModalVisible] = useState(false)

  async function onConfirm() {
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
      <MemberActionButton
        destructive
        disabled={disabled}
        horizontal={horizontal}
        icon='personRemove'
        title={isSelf ? t('memberInfo.leaveGroup') : t('memberInfo.removeFromGroup')}
        onPress={async () => setModalVisible(true)}
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

function MemberActions({
  groupInfo,
  memberInfo,
  splits,
}: {
  groupInfo: GroupUserInfo
  memberInfo: Member
  splits?: SplitInfo[]
}) {
  const user = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()

  const { mutateAsync: setGroupAccessMutation } = useSetGroupAccessMutation(
    groupInfo.id,
    memberInfo.id
  )
  const { mutateAsync: setGroupAdminMutation } = useSetGroupAdminMutation(
    groupInfo.id,
    memberInfo.id
  )

  const isSelf = memberInfo.id === user?.id

  const canManageAccess =
    groupInfo.permissions.canManageAccess() && memberInfo.id !== groupInfo.owner && !isSelf
  const canManageAdmin =
    groupInfo.permissions.canManageAdmins() &&
    memberInfo.id !== groupInfo.owner &&
    !isSelf &&
    memberInfo.hasAccess
  const canRemoveMember =
    (groupInfo.permissions.canRemoveMembers() || isSelf) && memberInfo.id !== groupInfo.owner

  const onlyRemoveMember = !canManageAccess && !canManageAdmin && canRemoveMember
  const showAnything = canManageAccess || canManageAdmin || canRemoveMember

  if (!showAnything) {
    return null
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', gap: 8 }}>
      {!onlyRemoveMember && (
        <>
          <MemberActionButton
            disabled={!canManageAccess}
            icon={memberInfo.hasAccess ? 'lock' : 'lockOpen'}
            title={memberInfo.hasAccess ? t('member.revokeAccess') : t('member.giveAccess')}
            color={memberInfo.hasAccess ? theme.colors.error : undefined}
            onPress={async () => {
              await setGroupAccessMutation(!memberInfo.hasAccess)
            }}
          />
          <MemberActionButton
            disabled={!canManageAdmin}
            icon={memberInfo.isAdmin ? 'shield' : 'addModerator'}
            title={memberInfo.isAdmin ? t('member.revokeAdmin') : t('member.makeAdmin')}
            onPress={async () => {
              await setGroupAdminMutation(!memberInfo.isAdmin)
            }}
          />
        </>
      )}
      <RemoveMemberButton
        groupInfo={groupInfo}
        memberInfo={memberInfo}
        isSelf={isSelf}
        memberId={memberInfo.id}
        splits={splits}
        disabled={!canRemoveMember}
        horizontal={onlyRemoveMember}
      />
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

          {memberInfo &&
            (!memberInfo.hasAccess || memberInfo.isAdmin || memberInfo.id === groupInfo?.owner) && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {memberInfo.id === groupInfo?.owner ? (
                  <>
                    <View style={{ width: 24, alignItems: 'center' }}>
                      <Icon name='shield' size={20} color={theme.colors.tertiary} />
                    </View>
                    <Text style={{ color: theme.colors.tertiary, fontSize: 18 }}>
                      {t('memberInfo.owner')}
                    </Text>
                  </>
                ) : !memberInfo.hasAccess ? (
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

      {groupInfo && memberInfo && (
        <MemberActions groupInfo={groupInfo} memberInfo={memberInfo} splits={splits} />
      )}
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
      maxWidth={550}
      maxHeight={650}
    >
      {error || groupInfo?.permissions?.canReadMembers?.() === false ? (
        <MemberInfoError groupInfo={groupInfo} />
      ) : (
        <MemberScreen groupInfo={groupInfo} memberInfo={memberInfo} />
      )}
    </ModalScreen>
  )
}
