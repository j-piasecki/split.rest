import { ContextMenu } from '@components/ContextMenu'
import { useSetGroupAccessMutation } from '@hooks/database/useGroupAccessMutation'
import { useSetGroupAdminMutation } from '@hooks/database/useGroupAdminMutation'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Image, Text, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupInfo
}

export function MemberRow({ member, info }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()
  const { mutate: setGroupAccessMutation } = useSetGroupAccessMutation(info.id, member.id)
  const { mutate: setGroupAdminMutation } = useSetGroupAdminMutation(info.id, member.id)

  return (
    <ContextMenu
      disabled={member.id === user?.id || !info.isAdmin}
      items={[
        {
          label: member.hasAccess ? 'Revoke access' : 'Give access',
          onPress: () => {
            setGroupAccessMutation(!member.hasAccess)
          },
        },
        {
          label: member.isAdmin ? 'Revoke admin' : 'Make admin',
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
          paddingVertical: 16,
          paddingHorizontal: isSmallScreen ? 0 : 16,
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
            {member.name}
          </Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'flex-end', minWidth: 100 }}>
          <Text
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
      </View>
    </ContextMenu>
  )
}
