import { Button } from '@components/Button'
import { setGroupAccess } from '@database/setGroupAccess'
import { setGroupAdmin } from '@database/setGroupAdmin'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Text, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MemberRowProps {
  member: Member
  info: GroupInfo
  forceReload: () => void
}

export function MemberRow({ member, info, forceReload }: MemberRowProps) {
  const user = useAuth()
  const theme = useTheme()

  return (
    <View
      key={member.id}
      style={{
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: theme.colors.outlineVariant,
        borderBottomWidth: 1,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
          {member.name}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          gap: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {info.isAdmin && member.id !== user?.uid && member.hasAccess && (
          <Button
            title='Revoke access'
            onPress={() => {
              setGroupAccess(info.id, member.id, false)
                .then(forceReload)
                .catch((e) => {
                  alert(e.message)
                })
            }}
          />
        )}
        {info?.isAdmin && member.id !== user?.uid && !member.hasAccess && (
          <Button
            title='Give access'
            onPress={() => {
              setGroupAccess(info.id, member.id, true)
                .then(forceReload)
                .catch((e) => {
                  alert(e.message)
                })
            }}
          />
        )}

        {info.isAdmin && member.id !== user?.uid && member.isAdmin && (
          <Button
            title='Revoke admin'
            onPress={() => {
              setGroupAdmin(info.id, member.id, false)
                .then(forceReload)
                .catch((e) => {
                  alert(e.message)
                })
            }}
          />
        )}
        {info.isAdmin && member.id !== user?.uid && !member.isAdmin && member.hasAccess && (
          <Button
            title='Make admin'
            onPress={() => {
              setGroupAdmin(info.id, member.id, true)
                .then(forceReload)
                .catch((e) => {
                  alert(e.message)
                })
            }}
          />
        )}
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'flex-end', minWidth: 100 }}>
        <Text
          style={{
            fontSize: 20,
            color:
              Number(member.balance) === 0
                ? theme.colors.outline
                : Number(member.balance) > 0
                  ? 'green'
                  : 'red',
          }}
        >
          {Number(member.balance) > 0 && '+'}
          {member.balance}
        </Text>
      </View>
    </View>
  )
}
