import { SplitRow } from './SplitRow'
import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { Shimmer } from '@components/Shimmer'
import { Text } from '@components/Text'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import { invalidateGroup } from '@utils/queryClient'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo, SplitPermissionType } from 'shared'

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

function SplitsShimmer({ count }: { count: number }) {
  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={{
              width: '100%',
              height: 72,
              gap: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
          >
            <Shimmer
              offset={1 - index * 0.05}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
            />
            <Shimmer
              offset={1 - index * 0.05 - 0.2}
              style={{
                flex: 2,
                height: 28,
                borderRadius: 14,
              }}
            />
            <Shimmer
              offset={1 - index * 0.05 - 0.6}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 14,
              }}
            />
          </View>
          {index !== count - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  )
}

export interface SplitsListProps {
  info: GroupUserInfo | undefined
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
  const insets = useSafeAreaInsets()
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
      <FlatListWithHeader
        showBackButton
        refreshing={isLoading || isRefetching}
        onRefresh={refreshData}
        hideHeader={!showPullableHeader}
        contentContainerStyle={{
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          paddingBottom: 64,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainer,
            }}
          >
            {(isLoading || !info) && <SplitsShimmer count={5} />}
            {!isLoading && info && (
              <Text style={{ fontSize: 20, color: theme.colors.outline, paddingVertical: 32 }}>
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
