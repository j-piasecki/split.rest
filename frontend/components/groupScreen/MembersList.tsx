import { MemberRow } from './MemberRow'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

export interface MembersListProps {
  info: GroupInfo | undefined
}

export function MembersList({ info }: MembersListProps) {
  const theme = useTheme()
  const { members, isLoading, fetchNextPage, isFetchingNextPage } = useGroupMembers(info?.id ?? 0)

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, flex: !members?.length ? 1 : undefined }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {!isLoading && members.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No members</Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id}
        renderItem={({ item: member }) => (
          <MemberRow member={member} info={info}/>
        )}
      />
    </View>
  )
}
