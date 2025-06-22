import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { Icon, IconName } from '@components/Icon'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useRouter } from 'expo-router'
import React from 'react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import { CurrencyUtils } from 'shared'
import { GroupUserInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupUserInfo
  iconOnly: boolean
  style?: StyleProp<ViewStyle>
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
        boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Icon name={icon} size={16} color={theme.colors.secondary} />
    </View>
  )
}

export function MemberRow({ member, info, iconOnly, style }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info.id)
  const { mutate: setGroupAccessMutation } = useSetGroupAccessMutation(info.id, member.id)
  const { mutate: setGroupAdminMutation } = useSetGroupAdminMutation(info.id, member.id)

  const hasContextActions = permissions?.canManageAccess() || permissions?.canManageAdmins()
  const contextMenuDisabled =
    member.deleted || member.id === user?.id || iconOnly || !hasContextActions

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
          destructive: member.hasAccess,
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
      style={({ pressed, hovered }) => {
        return [{
          userSelect: 'none',
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
        }, style]
      }}
      onPress={() => {
        router.navigate(`/group/${info.id}/member/${member.id}`)
      }}
    >
      <View
        key={member.id}
        style={[
          {
            paddingVertical: 10,
            paddingLeft: iconOnly ? 14 : 10,
            paddingRight: hasContextActions ? 4 : 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={{
            justifyContent: 'center',
            marginRight: 14,
            padding: 2,
            borderWidth: 2,
            borderRadius: 24,
            borderColor: getBalanceColor(Number(member.balance), theme),
          }}
        >
          <ProfilePicture userId={member.id} size={36} />
          {(member.isAdmin || !member.hasAccess) && (
            <Badge icon={member.hasAccess ? 'shield' : 'lock'} />
          )}
        </View>
        {!iconOnly && (
          <>
            <View style={{ flex: 1, justifyContent: 'center', marginRight: 8 }}>
              <Text
                selectable={false}
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: theme.colors.onSurface,
                  marginTop: member.displayName !== null ? 4 : 0,
                }}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {member.displayName ?? member.name}{' '}
                {member.deleted && (
                  <Text
                    style={{
                      color: theme.colors.outline,
                      fontWeight: 200,
                    }}
                  >
                    {t('deletedUser')}
                  </Text>
                )}
              </Text>

              {member.displayName && (
                <Text
                  selectable={false}
                  numberOfLines={1}
                  style={{ fontSize: 10, color: theme.colors.outline }}
                >
                  {member.name}
                </Text>
              )}
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', minWidth: 100 }}>
              <Text
                selectable={false}
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: getBalanceColor(Number(member.balance), theme),
                }}
              >
                {CurrencyUtils.format(member.balance, info.currency, true, true)}
              </Text>
            </View>

            {hasContextActions && (
              <RoundIconButton
                disabled={contextMenuDisabled}
                icon='moreVertical'
                onPress={(e) => {
                  contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
                }}
                style={{ marginLeft: 4, opacity: contextMenuDisabled ? 0.4 : 1 }}
              />
            )}
          </>
        )}
      </View>
    </ContextMenu>
  )
}
