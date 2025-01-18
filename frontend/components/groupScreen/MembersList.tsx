import { MemberRow } from './MemberRow'
import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import Header from '@components/Header'
import { PullableFlatList } from '@components/PullableFlatList'
import { Shimmer } from '@components/Shimmer'
import { Text } from '@components/Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { queryClient } from '@utils/queryClient'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInfo } from 'shared'

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
  info: GroupInfo | undefined
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
  iconOnly,
  headerComponent,
  footerComponent,
  applyBottomInset = false,
  showPullableHeader,
  onRefresh,
}: MembersListProps) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const threeBarLayout = useThreeBarLayout()
  const [fabRef, scrollHandler] = useFABScrollHandler()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const { members, isLoading, fetchNextPage, isFetchingNextPage, isRefetching } = useGroupMembers(
    info?.id
  )

  function refreshData() {
    if (info) {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', info.id] })
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
          maxWidth: 768,
          width: '100%',
          alignSelf: 'center',
          paddingBottom: 88 + (applyBottomInset ? insets.bottom : 0),
          paddingHorizontal: iconOnly ? 4 : 16,
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
        onEndReached={() => !isFetchingNextPage && fetchNextPage()}
        keyExtractor={(item) => item.id}
        renderItem={({ item: member }) =>
          info ? <MemberRow member={member} info={info} iconOnly={iconOnly ?? false} /> : null
        }
        ItemSeparatorComponent={iconOnly ? undefined : Divider}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        onScroll={scrollHandler}
        onScrollEndDrag={scrollHandler}
        onMomentumScrollEnd={scrollHandler}
      />

      {permissions?.canInviteMembers() && (
        <View
          style={{
            position: 'absolute',
            bottom: (threeBarLayout ? 8 : 16) + (applyBottomInset ? insets.bottom : 0),
            right: threeBarLayout ? 8 : 16,
          }}
        >
          <FloatingActionButton
            ref={fabRef}
            icon='addMember'
            title={iconOnly ? '' : t('inviteMember.inviteMember')}
            onPress={() => {
              router.navigate(`/group/${info?.id}/inviteMember`)
            }}
          />
        </View>
      )}
    </View>
  )
}
