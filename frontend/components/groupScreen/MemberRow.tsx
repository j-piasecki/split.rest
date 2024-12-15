import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import RoundIconButton from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupInfo
}

export function MemberRow({ member, info }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { t } = useTranslation()
  const { mutate: setGroupAccessMutation } = useSetGroupAccessMutation(info.id, member.id)
  const { mutate: setGroupAdminMutation } = useSetGroupAdminMutation(info.id, member.id)

  const contextMenuDisabled = member.id === user?.id || !info.isAdmin

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
          padding: 16,
          marginHorizontal: isSmallScreen ? 0 : 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: theme.colors.outlineVariant,
          borderBottomWidth: 1,
        }}
      >
        <View style={{ justifyContent: 'center', marginRight: 16 }}>
          <Image
            source={{ uri: getProfilePictureUrl(member.id) }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        </View>
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

        <RoundIconButton
          disabled={contextMenuDisabled}
          icon='moreVertical'
          onPress={(e) => {
            contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
          }}
          style={{ marginLeft: 16, opacity: contextMenuDisabled ? 0 : 0.7 }}
        />
      </View>
    </ContextMenu>
  )
}
