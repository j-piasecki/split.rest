import { MemberRow } from './MemberRow'
import { getMembers } from '@database/getMembers'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo, Member } from 'shared'

export interface MembersListProps {
  info: GroupInfo | undefined
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
    if (user?.id && info?.id) {
      loadingMoreRef.current = true

      getMembers(info?.id)
        .then(setMembers)
        .then(() => {
          loadingMoreRef.current = false
        })
    }
  }, [user?.id, info?.id, setMembers, counter])

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, flex: !members?.length ? 1 : undefined }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {members === null && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {members !== null && members.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No members</Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        keyExtractor={(item) => item.id}
        renderItem={({ item: member }) => (
          <MemberRow member={member} info={info} forceReload={forceReload} />
        )}
      />
    </View>
  )
}
