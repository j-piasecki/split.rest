import { BottomBar } from './BottomBar'
import { SplitRow } from './SplitRow'
import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import { ListEmptyComponent } from '@components/ListEmptyComponent'
import { Shimmer } from '@components/Shimmer'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroup } from '@utils/queryClient'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo, SplitInfo } from 'shared'

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 2, backgroundColor: theme.colors.surface }} />
}

function SplitsShimmer({ count }: { count: number }) {
  const theme = useTheme()

  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              {
                width: '100%',
                height: 72,
                gap: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                borderRadius: 4,
                backgroundColor: theme.colors.surfaceContainer,
              },
              index === count - 1 && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
            ]}
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
  emptyMessage?: string
  showPullableHeader?: boolean
  hideFab?: boolean
  hideBottomBar?: boolean
  onRefresh?: () => void
  applyBottomInset?: boolean
  applyHorizontalPadding?: boolean
  splits: SplitInfo[]
  isLoading: boolean
  isRefetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export function SplitsList({
  info,
  headerComponent,
  footerComponent,
  showPullableHeader,
  onRefresh,
  emptyMessage,
  applyBottomInset = false,
  applyHorizontalPadding = true,
  hideFab = false,
  hideBottomBar = false,
  splits,
  isLoading,
  fetchNextPage,
  isFetchingNextPage,
  isRefetching,
  hasNextPage,
}: SplitsListProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const { t } = useTranslation()

  const isSmallScreen = displayClass <= DisplayClass.Medium
  const [fabRef, scrollHandler] = useFABScrollHandler(!hideFab || !hideBottomBar)

  function refreshData() {
    if (info) {
      invalidateGroup(info.id)
      onRefresh?.()
    }
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatListWithHeader
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refreshData}
        hideHeader={!showPullableHeader}
        contentContainerStyle={{
          maxWidth: displayClass < DisplayClass.Large ? 900 : undefined,
          width: '100%',
          flexGrow: 1,
          alignSelf: 'center',
          paddingLeft: insets.left + (applyHorizontalPadding ? 12 : 0),
          paddingRight: insets.right + (applyHorizontalPadding ? 12 : 0),
          paddingBottom: 96 + (applyBottomInset ? insets.bottom : 0),
        }}
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={isLoading || !info}
            emptyText={emptyMessage}
            loadingPlaceholder={<SplitsShimmer count={5} />}
          />
        }
        data={splits}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: split, index }) => (
          <SplitRow
            split={split}
            info={info}
            style={[
              { borderRadius: 4 },
              index === splits.length - 1 && {
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              },
            ]}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        scrollHandler={scrollHandler}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 8 + (applyBottomInset ? insets.bottom : 0),
          right: 16,
          left: isSmallScreen ? 16 : undefined,
        }}
      >
        {isSmallScreen && !hideBottomBar && (
          <BottomBar
            info={info}
            ref={fabRef}
            disableSplit={info?.locked}
          />
        )}
        {!isSmallScreen && !hideFab && info?.permissions?.canCreateSplits?.() && (
          <FloatingActionButton
            ref={fabRef}
            icon='split'
            title={t('groupInfo.addSplit')}
            onPress={() => {
              SplitCreationContext.create().begin()
              router.navigate(`/group/${info?.id}/addSplit`)
            }}
          />
        )}
      </View>
    </View>
  )
}
