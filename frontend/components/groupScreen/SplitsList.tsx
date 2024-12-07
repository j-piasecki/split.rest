import { SplitRow } from './SplitRow'
import { getSplits } from '@database/getSplits'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo, SplitInfo } from 'shared'

export interface SplitsListProps {
  info: GroupInfo | undefined
}

export function SplitsList({ info }: SplitsListProps) {
  const user = useAuth()
  const theme = useTheme()
  const [splits, setSplits] = useState<SplitInfo[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  const loadMore = () => {
    if (user && splits && splits.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getSplits(info.id, splits[splits.length - 1].timestamp).then((newSplits) => {
        setSplits([...splits, ...newSplits])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user?.id && info?.id && !loadingMoreRef.current) {
      loadingMoreRef.current = true

      getSplits(info?.id)
        .then(setSplits)
        .then(() => {
          loadingMoreRef.current = false
        })
    }
  }, [user?.id, info?.id, setSplits, counter])

  return (
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, flex: !splits?.length ? 1 : undefined }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {splits === null && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {splits !== null && splits.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No splits</Text>
            )}
          </View>
        }
        data={splits}
        onEndReachedThreshold={50}
        onEndReached={loadMore}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: split }) => (
          <SplitRow split={split} info={info} forceReload={forceReload} />
        )}
      />
    </View>
  )
}
