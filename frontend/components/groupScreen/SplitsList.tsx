import { SplitRow } from './SplitRow'
import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import { Shimmer } from '@components/Shimmer'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass, useThreeBarLayout } from '@utils/dimensionUtils'
import { invalidateGroup } from '@utils/queryClient'
import { beginNewSplit } from '@utils/splitCreationContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo, SplitInfo } from 'shared'

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
  emptyComponent?: React.ReactElement
  showPullableHeader?: boolean
  hideFab?: boolean
  onRefresh?: () => void
  applyBottomInset?: boolean
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
  emptyComponent,
  applyBottomInset = false,
  hideFab = false,
  splits,
  isLoading,
  fetchNextPage,
  isFetchingNextPage,
  isRefetching,
  hasNextPage,
}: SplitsListProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const threeBarLayout = useThreeBarLayout()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)

  const isSmallScreen = displayClass === DisplayClass.Small
  const fabVisible = !hideFab && isSmallScreen && permissions?.canCreateSplits()
  const [fabRef, scrollHandler] = useFABScrollHandler(fabVisible)

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
          maxWidth: displayClass < DisplayClass.Large ? 900 : undefined,
          width: '100%',
          alignSelf: 'center',
          paddingLeft: insets.left + (threeBarLayout ? 0 : 12),
          paddingRight: insets.right + (threeBarLayout ? 0 : 12),
          paddingBottom: 88 + (applyBottomInset ? insets.bottom : 0),
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
            {!isLoading && info && emptyComponent}
          </View>
        }
        data={splits}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: split }) => <SplitRow split={split} info={info} />}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        scrollHandler={scrollHandler}
      />

      {fabVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 16 + (applyBottomInset ? insets.bottom : 0),
            right: 16,
          }}
        >
          <FloatingActionButton
            ref={fabRef}
            icon='split'
            title={t('groupInfo.addSplit')}
            onPress={() => {
              beginNewSplit()
              router.navigate(`/group/${info?.id}/addSplit`)
            }}
          />
        </View>
      )}
    </View>
  )
}
