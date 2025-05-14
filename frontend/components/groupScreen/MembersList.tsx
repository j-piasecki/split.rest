import { InviteMemberFab } from './InviteMemberFab'
import { MemberRow } from './MemberRow'
import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { useFABScrollHandler } from '@components/FloatingActionButton'
import { Shimmer } from '@components/Shimmer'
import { Text } from '@components/Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { queryClient } from '@utils/queryClient'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo } from 'shared'

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

function MembersShimmer({ count, iconOnly }: { count: number; iconOnly?: boolean }) {
  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={{
              width: '100%',
              height: 64,
              gap: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}
          >
            <Shimmer
              offset={1 - index * 0.05}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
              }}
            />

            {!iconOnly && (
              <>
                <Shimmer
                  offset={1 - index * 0.05 - 0.2}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 14,
                  }}
                />
                <Shimmer
                  offset={1 - index * 0.05 - 0.6}
                  style={{
                    width: 128,
                    height: 28,
                    borderRadius: 14,
                  }}
                />
              </>
            )}
          </View>
          {index !== count - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  )
}

export interface MembersListProps {
  info: GroupUserInfo | undefined
  lowToHigh?: boolean
  iconOnly?: boolean
  applyBottomInset?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerComponent?: React.ComponentType<any> | React.ReactElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  footerComponent?: React.ComponentType<any> | React.ReactElement
  showPullableHeader?: boolean
  onRefresh?: () => void
}

export function MembersList({
  info,
  lowToHigh,
  iconOnly,
  headerComponent,
  footerComponent,
  applyBottomInset = false,
  showPullableHeader,
  onRefresh,
}: MembersListProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const threeBarLayout = useThreeBarLayout()
  const [fabRef, scrollHandler] = useFABScrollHandler()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const { members, isLoading, fetchNextPage, isFetchingNextPage, isRefetching, hasNextPage } =
    useGroupMembers(info?.id, lowToHigh)

  function refreshData() {
    if (info) {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', info.id] })
      onRefresh?.()
    }
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatListWithHeader
        refreshing={isLoading || isRefetching}
        onRefresh={refreshData}
        showBackButton
        hideHeader={!showPullableHeader}
        contentContainerStyle={{
          maxWidth: 768,
          width: '100%',
          alignSelf: 'center',
          paddingBottom: 88 + (applyBottomInset ? insets.bottom : 0),
          paddingHorizontal: iconOnly ? 4 : 12,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainer,
            }}
          >
            {(isLoading || !info) && (
              <MembersShimmer count={Math.min(10, info?.memberCount ?? 10)} iconOnly={iconOnly} />
            )}
            {!isLoading && info && members.length === 0 && !iconOnly && (
              <Text style={{ fontSize: 20, color: theme.colors.outline, paddingVertical: 32 }}>
                {permissions?.canReadMembers()
                  ? t('noMembers')
                  : t('api.insufficientPermissions.group.readMembers')}
              </Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={0.5}
        onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id}
        renderItem={({ item: member }) =>
          info ? <MemberRow member={member} info={info} iconOnly={iconOnly ?? false} /> : null
        }
        ItemSeparatorComponent={iconOnly ? undefined : Divider}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        scrollHandler={scrollHandler}
      />

      <InviteMemberFab
        info={info}
        iconOnly={iconOnly}
        applyBottomInset={applyBottomInset}
        threeBarLayout={threeBarLayout}
        fabRef={fabRef}
      />
    </View>
  )
}
