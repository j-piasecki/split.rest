import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import React from 'react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupInfo
  iconOnly: boolean
}

function Badge({ icon }: { icon: IconName }) {
  const theme = useTheme()

  return (
    <View
      style={{
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceContainerHighest,
        right: -6,
        bottom: -6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={16} color={theme.colors.secondary} />
    </View>
  )
}

export function MemberRow({ member, info, iconOnly }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutate: setGroupAccessMutation } = useSetGroupAccessMutation(info.id, member.id)
  const { mutate: setGroupAdminMutation } = useSetGroupAdminMutation(info.id, member.id)

  const hasContextActions = permissions?.canManageAccess() || permissions?.canManageAdmins()
  const contextMenuDisabled = member.id === user?.id || iconOnly || !hasContextActions

  return (
    <ContextMenu
      ref={contextMenuRef}
      disabled={contextMenuDisabled}
      items={[
        {
          label: member.hasAccess ? t('member.revokeAccess') : t('member.giveAccess'),
          icon: member.hasAccess ? 'lock' : 'lockOpen',
          disabled: !permissions?.canManageAccess(),
          onPress: () => {
            setGroupAccessMutation(!member.hasAccess)
          },
        },
        {
          label: member.isAdmin ? t('member.revokeAdmin') : t('member.makeAdmin'),
          icon: member.isAdmin ? 'removeModerator' : 'addModerator',
          disabled: !permissions?.canManageAdmins() || !member.hasAccess,
          onPress: () => {
            setGroupAdminMutation(!member.isAdmin)
          },
        },
      ]}
    >
      <View
        key={member.id}
        style={{
          backgroundColor: theme.colors.surfaceContainer,
          paddingVertical: 10,
          paddingLeft: 10,
          paddingRight: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            justifyContent: 'center',
            marginRight: 14,
            padding: 2,
            borderWidth: 2,
            borderRadius: 24,
            borderColor:
              Number(member.balance) === 0
                ? theme.colors.balanceNeutral
                : Number(member.balance) < 0
                  ? theme.colors.balanceNegative
                  : theme.colors.balancePositive,
          }}
        >
          <Image
            source={{ uri: getProfilePictureUrl(member.id) }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          {(member.isAdmin || !member.hasAccess) && (
            <Badge icon={member.hasAccess ? 'shield' : 'lock'} />
          )}
        </View>
        {!iconOnly && (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text
                selectable={false}
                style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}
              >
                {member.name}
              </Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', minWidth: 100 }}>
              <Text
                selectable={false}
                style={{
                  fontSize: 20,
                  color:
                    Number(member.balance) === 0
                      ? theme.colors.balanceNeutral
                      : Number(member.balance) > 0
                        ? theme.colors.balancePositive
                        : theme.colors.balanceNegative,
                }}
              >
                {Number(member.balance) > 0 && '+'}
                {member.balance}
              </Text>
            </View>

            {hasContextActions && (
              <RoundIconButton
                disabled={contextMenuDisabled}
                icon='moreVertical'
                onPress={(e) => {
                  contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
                }}
                style={{ marginLeft: 16, opacity: contextMenuDisabled ? 0.2 : 0.7 }}
              />
            )}
          </>
        )}
      </View>
    </ContextMenu>
  )
}
