import { SplitRow } from './SplitRow'
import Header from '@components/Header'
import { PullableFlatList } from '@components/PullableFlatList'
import { Text } from '@components/Text'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import { invalidateGroup } from '@utils/queryClient'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'
import { GroupInfo, SplitPermissionType } from 'shared'

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
  showPullableHeader?: boolean
  onRefresh?: () => void
}

export function SplitsList({
  info,
  headerComponent,
  footerComponent,
  showPullableHeader,
  onRefresh,
}: SplitsListProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const { splits, isLoading, fetchNextPage, isFetchingNextPage, isRefetching } = useGroupSplits(
    info?.id,
    permissions?.canReadSplits() === SplitPermissionType.OnlyIfIncluded
  )

  function refreshData() {
    if (info) {
      invalidateGroup(info.id)
      onRefresh?.()
    }
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <PullableFlatList
        renderPullableHeader={
          showPullableHeader
            ? (pullValue) => {
                return (
                  <Header
                    showBackButton
                    offset={pullValue}
                    isWaiting={isLoading || isRefetching}
                    onPull={refreshData}
                  />
                )
              }
            : undefined
        }
        refreshControl={
          showPullableHeader ? undefined : (
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          )
        }
        contentContainerStyle={{
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
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>
                {permissions?.canReadSplits() === SplitPermissionType.None
                  ? t('api.insufficientPermissions.group.readSplits')
                  : t('noSplits')}
              </Text>
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
