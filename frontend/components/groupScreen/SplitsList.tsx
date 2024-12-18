import { SplitRow } from './SplitRow'
import { Text } from '@components/Text'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { GroupInfo } from 'shared'

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

export interface SplitsListProps {
  info: GroupInfo | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerComponent?: React.ComponentType<any> | React.ReactElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  footerComponent?: React.ComponentType<any> | React.ReactElement
}

export function SplitsList({ info, headerComponent, footerComponent }: SplitsListProps) {
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
          paddingHorizontal: 16,
          paddingBottom: 64,
        }}
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainer,
            }}
          >
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
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
      />
    </View>
  )
}
