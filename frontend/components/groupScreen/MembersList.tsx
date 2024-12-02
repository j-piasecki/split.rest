import { Button } from '@components/Button'
import { getMembers } from '@database/getMembers'
import { setGroupAccess } from '@database/setGroupAccess'
import { setGroupAdmin } from '@database/setGroupAdmin'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MembersListProps {
  info: GroupInfo | null
}

export function MembersList({ info }: MembersListProps) {
  const user = useAuth()
  const theme = useTheme()
  const [members, setMembers] = useState<Member[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  const loadMore = () => {
    if (user && members && members.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getMembers(info.id, members[members.length - 1].id).then((newMembers) => {
        setMembers([...members, ...newMembers])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user?.uid && info?.id) {
      loadingMoreRef.current = true

      getMembers(info?.id)
        .then(setMembers)
        .then(() => {
          loadingMoreRef.current = false
        })
    }
  }, [user?.uid, info?.id, setMembers, counter])

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ flex: 1, paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {members === null && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {members !== null && members.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No members</Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={50}
        onEndReached={loadMore}
        renderItem={({ item: member }) => {
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
        }}
      />
    </View>
  )
}
