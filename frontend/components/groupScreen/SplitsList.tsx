import { SplitRow } from './SplitRow'
import { Text } from '@components/Text'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { GroupInfo } from 'shared'

export interface SplitsListProps {
  info: GroupInfo | undefined
}

export function SplitsList({ info }: SplitsListProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { splits, isLoading, fetchNextPage, isFetchingNextPage } = useGroupSplits(info?.id)

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          flex: !splits?.length ? 1 : undefined,
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {!isLoading && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>{t('noSplits')}</Text>
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
