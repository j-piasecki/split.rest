import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { Pane, PaneHeader } from '@components/Pane'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useCreateGroupJoinLink } from '@hooks/database/useCreateGroupJoinLink'
import { useDeleteGroupJoinLink } from '@hooks/database/useDeleteGroupJoinLink'
import { useDirectGroupInvites } from '@hooks/database/useDirectGroupInvites'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupJoinLink } from '@hooks/database/useGroupJoinLink'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetInviteWithdrawnMutation } from '@hooks/database/useInviteWithdrawnMutation'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { GroupPermissions } from '@utils/GroupPermissions'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, View } from 'react-native'
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
  showSeparator,
}: {
  invite: GroupInviteWithInvitee
  info: GroupUserInfo
  showSeparator: boolean
}) {
  const theme = useTheme()
  const {
    mutateAsync: setInvitationWithdrawn,
    isPending,
    error,
  } = useSetInviteWithdrawnMutation(info.id, invite.invitee.id)

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: theme.colors.surfaceContainer,
          borderBottomWidth: showSeparator ? 1 : 0,
          borderColor: theme.colors.outlineVariant,
        },
        styles.paneShadow,
      ]}
    >
      <Text style={{ flex: 1, color: theme.colors.onSurface }}>{invite.invitee.name}</Text>
    </View>
  )
}

function Form({ info }: { info: GroupUserInfo }) {
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info.id)
  const { invites, hasNextPage, isFetchingNextPage, fetchNextPage } = useDirectGroupInvites(info.id)

  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
      }}
      data={invites}
      renderItem={({ item, index }) => (
        <InviteRow invite={item} info={info} showSeparator={index !== invites.length - 1} />
      )}
      onEndReachedThreshold={0.5}
      onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
      keyExtractor={(item) => item.invitee.id}
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          {permissions?.canSeeJoinLink() && (
            <JoinLinkManager info={info} permissions={permissions} />
          )}
          <View
            style={[
              {
                backgroundColor: theme.colors.surfaceContainer,
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,
              },
              styles.paneShadow,
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
      ListFooterComponent={
        <View
          style={[
            {
              height: 16,
              backgroundColor: theme.colors.surfaceContainer,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            },
            styles.paneShadow,
          ]}
        />
      }
      ListEmptyComponent={
        <View
          style={[
            {
              backgroundColor: theme.colors.surfaceContainer,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
            },
            styles.paneShadow,
          ]}
        >
          <Text
            style={{
              color: theme.colors.onSurface,
              paddingVertical: 16,
              fontSize: 20,
              textAlign: 'center',
            }}
          >
            {t('settings.invitations.noInvitations')}
          </Text>
        </View>
      }
    />
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.invitations')}
      maxWidth={500}
      maxHeight={600}
      opaque={false}
      slideAnimation={false}
    >
      {info && <Form info={info} />}
    </ModalScreen>
  )
}
