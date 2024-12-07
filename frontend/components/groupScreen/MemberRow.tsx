import { Button } from '@components/Button'
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
  const setGroupAccessMutation = useSetGroupAccessMutation(info.id, member.id)
  const setGroupAdminMutation = useSetGroupAdminMutation(info.id, member.id)

  return (
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
      {info.isAdmin && member.id !== user?.id && (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            gap: 4,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {member.hasAccess && (
            <Button
              title='Revoke access'
              onPress={() => {
                setGroupAccessMutation.mutate(false)
              }}
            />
          )}
          {!member.hasAccess && (
            <Button
              title='Give access'
              onPress={() => {
                setGroupAccessMutation.mutate(true)
              }}
            />
          )}

          {member.isAdmin && (
            <Button
              title='Revoke admin'
              onPress={() => {
                setGroupAdminMutation.mutate(false)
              }}
            />
          )}
          {!member.isAdmin && member.hasAccess && (
            <Button
              title='Make admin'
              onPress={() => {
                setGroupAdminMutation.mutate(true)
              }}
            />
          )}
        </View>
      )}
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
  )
}
