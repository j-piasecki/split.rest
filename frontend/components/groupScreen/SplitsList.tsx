import { SplitRow } from './SplitRow'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

export interface SplitsListProps {
  info: GroupInfo | undefined
}

export function SplitsList({ info }: SplitsListProps) {
  const theme = useTheme()
  const { splits, isLoading, fetchNextPage, isFetchingNextPage } = useGroupSplits(info?.id)

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, flex: !splits?.length ? 1 : undefined }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {!isLoading && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No splits</Text>
            )}
          </View>
        }
        data={splits}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: split }) => <SplitRow split={split} info={info} />}
      />
    </View>
  )
}
