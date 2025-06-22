import { Button } from '@components/Button'
import { useFABScrollHandler } from '@components/FloatingActionButton'
import { ListEmptyComponent } from '@components/ListEmptyComponent'
import ModalScreen from '@components/ModalScreen'
import { Pane, PaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { InviteMemberFab } from '@components/groupScreen/InviteMemberFab'
import { useCreateGroupJoinLink } from '@hooks/database/useCreateGroupJoinLink'
import { useDeleteGroupJoinLink } from '@hooks/database/useDeleteGroupJoinLink'
import { useDirectGroupInvites } from '@hooks/database/useDirectGroupInvites'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupJoinLink } from '@hooks/database/useGroupJoinLink'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useInviteUserToGroupMutation } from '@hooks/database/useInviteUserToGroup'
import { useSetInviteWithdrawnMutation } from '@hooks/database/useInviteWithdrawnMutation'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { GroupPermissions } from '@utils/GroupPermissions'
import { ApiError } from '@utils/makeApiRequest'
import { invalidateDirectGroupInvites } from '@utils/queryClient'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, StyleProp, View, ViewStyle } from 'react-native'
import { GroupInviteWithInvitee, GroupUserInfo } from 'shared'

function JoinLinkManager({
  info,
  permissions,
}: {
  info: GroupUserInfo
  permissions: GroupPermissions
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: link, isLoading: isLoadingLink } = useGroupJoinLink(info.id)
  const { mutateAsync: createJoinLink, isPending: isCreatingJoinLink } = useCreateGroupJoinLink()
  const { mutateAsync: deleteJoinLink, isPending: isDeletingJoinLink } = useDeleteGroupJoinLink()

  const linkText = __DEV__
    ? `http://localhost:8081/join/${link?.uuid}`
    : `https://split.rest/join/${link?.uuid}`

  return (
    <Pane
      icon='link'
      title={t('groupSettings.joinLink.joinLink')}
      textLocation='start'
      containerStyle={{ padding: 16 }}
    >
      {isLoadingLink && <ActivityIndicator color={theme.colors.primary} />}
      {!isLoadingLink && (
        <>
          {!link && permissions.canCreateJoinLink() && (
            <Button
              leftIcon='addLink'
              isLoading={isCreatingJoinLink}
              title={t('groupSettings.joinLink.create')}
              onPress={() => createJoinLink(info.id)}
            />
          )}
          {link && (
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                  value={linkText}
                  editable={false}
                  style={{ flex: 1 }}
                  selectTextOnFocus
                />
                <Button
                  leftIcon='copy'
                  onPress={() => {
                    Clipboard.setStringAsync(linkText)
                  }}
                />
              </View>
              {permissions.canDeleteJoinLink() && (
                <Button
                  leftIcon='deleteLink'
                  title={t('groupSettings.joinLink.delete')}
                  isLoading={isDeletingJoinLink}
                  onPress={() => deleteJoinLink(info.id)}
                />
              )}
            </View>
          )}
        </>
      )}
    </Pane>
  )
}

function InviteRow({
  invite,
  info,
  permissions,
  showSeparator,
  manageOnlyOwnInvites,
  style,
}: {
  invite: GroupInviteWithInvitee
  info: GroupUserInfo
  permissions: GroupPermissions
  showSeparator: boolean
  manageOnlyOwnInvites: boolean
  style?: StyleProp<ViewStyle>
}) {
  const theme = useTheme()
  const snack = useSnack()
  const { t } = useTranslation()
  const { mutateAsync: setInvitationWithdrawn, isPending: isWithdrawing } =
    useSetInviteWithdrawnMutation(info.id, manageOnlyOwnInvites)
  const { mutateAsync: inviteUser, isPending: isInviting } = useInviteUserToGroupMutation(info.id)

  function handleError(error: unknown) {
    if (error instanceof ApiError) {
      alert(t(error.message, error.args))
    } else {
      alert(t('unknownError'))
    }
  }

  return (
    <View
      style={[
        {
          justifyContent: 'space-between',
          padding: 16,
          paddingBottom: 48,
          backgroundColor: theme.colors.surfaceContainer,
          gap: 8,
          marginBottom: showSeparator ? 2 : 0,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <ProfilePicture userId={invite.invitee.id} size={32} />
        <Text style={{ color: theme.colors.primary, fontSize: 20, fontWeight: 600 }}>
          {invite.invitee.name}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 500 }}>
          {t('settings.invitations.invitedBy')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ProfilePicture userId={invite.createdBy.id} size={24} />
          <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 500 }}>
            {invite.createdBy.name}
          </Text>
        </View>
      </View>

      <Text style={{ color: theme.colors.outline, fontSize: 16, fontWeight: 500 }}>
        {t('settings.invitations.invitedOn', {
          date: new Date(invite.createdAt).toLocaleDateString(),
        })}
      </Text>
      {invite.rejected && (
        <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: 500 }}>
          {t('settings.invitations.inviteWasRejected')}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8, position: 'absolute', right: 16, bottom: 8 }}>
        {invite.rejected && permissions.canInviteMembers() && (
          <RoundIconButton
            icon='cached'
            isLoading={isWithdrawing || isInviting}
            onPress={() => {
              inviteUser(invite.invitee.id)
                .then(() => {
                  snack.show({ message: t('settings.invitations.inviteResent') })
                })
                .catch(handleError)
            }}
          />
        )}
        <RoundIconButton
          icon='close'
          isLoading={isWithdrawing || isInviting}
          onPress={() => {
            setInvitationWithdrawn({ withdrawn: true, userId: invite.invitee.id })
              .then(() => {
                snack.show({
                  message: t('settings.invitations.inviteWithdrawn'),
                  actionText: t('undo'),
                  action: async () => {
                    try {
                      await setInvitationWithdrawn({ withdrawn: false, userId: invite.invitee.id })
                    } catch (error) {
                      handleError(error)
                    }
                  },
                })
              })
              .catch(handleError)
          }}
        />
      </View>
    </View>
  )
}

function Form({ info, permissions }: { info: GroupUserInfo; permissions: GroupPermissions }) {
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const [fabRef, scrollHandler] = useFABScrollHandler()
  const { t } = useTranslation()

  const manageOnlyOwnInvites =
    !permissions.canManageAllDirectInvites() && permissions.canManageDirectInvites()
  const { invites, hasNextPage, isFetchingNextPage, fetchNextPage, isRefetching, isLoading } =
    useDirectGroupInvites(info.id, manageOnlyOwnInvites)

  function refresh() {
    invalidateDirectGroupInvites(info.id)
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 96,
        }}
        data={invites}
        renderItem={({ item, index }) => (
          <InviteRow
            invite={item}
            info={info}
            permissions={permissions}
            showSeparator={index !== invites.length - 1}
            manageOnlyOwnInvites={manageOnlyOwnInvites}
            style={[{borderRadius: 4}, index === invites.length - 1 && {
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }]}
          />
        )}
        onRefresh={refresh}
        refreshing={isRefetching}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
        keyExtractor={(item) => item.invitee.id}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            {permissions?.canSeeJoinLink() && (
              <JoinLinkManager info={info} permissions={permissions} />
            )}
            <View
              style={[
                {
                  backgroundColor: theme.colors.surfaceContainer,
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  marginBottom: 2,
                },
              ]}
            >
              <PaneHeader
                icon='stackedEmail'
                title={t('settings.invitations.directInvitations')}
                textLocation='start'
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={isLoading}
            emptyText={t('settings.invitations.noInvitations')}
            loadingPlaceholder={<View style={{
              backgroundColor: theme.colors.surfaceContainer,
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 32,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}>
              <ActivityIndicator color={theme.colors.primary} />
              </View>}
          />

         
        }
        onScroll={scrollHandler}
        onScrollBeginDrag={scrollHandler}
        onScrollEndDrag={scrollHandler}
        onMomentumScrollEnd={scrollHandler}
        onMomentumScrollBegin={scrollHandler}
      />
      <InviteMemberFab info={info} fabRef={fabRef} applyBottomInset />
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.invitations')}
      maxWidth={500}
      maxHeight={600}
      opaque={false}
      slideAnimation={false}
    >
      {info && permissions && <Form info={info} permissions={permissions} />}
    </ModalScreen>
  )
}
