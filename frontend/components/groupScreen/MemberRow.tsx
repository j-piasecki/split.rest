import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupInfo
  iconOnly: boolean
}

export function MemberRow({ member, info, iconOnly }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { t } = useTranslation()
  const { mutate: setGroupAccessMutation } = useSetGroupAccessMutation(info.id, member.id)
  const { mutate: setGroupAdminMutation } = useSetGroupAdminMutation(info.id, member.id)

  const contextMenuDisabled = member.id === user?.id || !info.isAdmin || iconOnly

  return (
    <ContextMenu
      ref={contextMenuRef}
      disabled={contextMenuDisabled}
      items={[
        {
          label: member.hasAccess ? t('member.revokeAccess') : t('member.giveAccess'),
          icon: member.hasAccess ? 'lock' : 'lockOpen',
          onPress: () => {
            setGroupAccessMutation(!member.hasAccess)
          },
        },
        {
          label: member.isAdmin ? t('member.revokeAdmin') : t('member.makeAdmin'),
          icon: member.isAdmin ? 'removeModerator' : 'addModerator',
          onPress: () => {
            setGroupAdminMutation(!member.isAdmin)
          },
          disabled: !member.hasAccess,
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

            {info.isAdmin && (
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
