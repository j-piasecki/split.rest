import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import { ListEmptyComponent } from '@components/ListEmptyComponent'
import { FullPaneHeader } from '@components/Pane'
import { SegmentedButton } from '@components/SegmentedButton'
import { Shimmer } from '@components/Shimmer'
import { useSnack } from '@components/SnackBar'
import { GROUP_ROW_HEIGHT, GroupRow } from '@components/homeScreen/GroupRow'
import { InvitationsButton } from '@components/homeScreen/InvitationsButton'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { useNotificationPermission } from '@hooks/useNotificationPermission'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroupInvites, invalidateUserGroups } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function Divider() {
  return <View style={{ width: '100%', height: 2, backgroundColor: 'transparent' }} />
}

function GroupsShimmer({ count }: { count: number }) {
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const theme = useTheme()

  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              {
                width: '100%',
                height: GROUP_ROW_HEIGHT,
                gap: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                backgroundColor: theme.colors.surfaceContainer,
                borderRadius: 4,
              },
              index === count - 1 && {
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              },
            ]}
          >
            <Shimmer
              offset={1 - index * 0.05}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 14,
              }}
            />

            <View
              style={{
                flexDirection: isSmallScreen ? 'column' : 'row',
                gap: isSmallScreen ? 4 : 20,
                alignItems: 'flex-end',
              }}
            >
              <Shimmer
                offset={1 - index * 0.05 + 0.65}
                style={{
                  width: 60,
                  height: 24,
                  borderRadius: 14,
                }}
              />
              <Shimmer
                offset={1 - index * 0.05 + (isSmallScreen ? 0.65 : 0.7)}
                style={{
                  width: 60,
                  height: 24,
                  borderRadius: 14,
                }}
              />
            </View>
          </View>
          {index !== count - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  )
}

let visibleGroupsSnackShown = false
let hiddenGroupsSnackShown = false
function VisibilityFilter({
  style,
  onChange,
}: {
  style?: StyleProp<ViewStyle>
  onChange: (hidden: boolean) => void
}) {
  const snack = useSnack()
  const { t } = useTranslation()
  const [hidden, setHidden] = useState(false)

  return (
    <SegmentedButton
      // this seems to work with flex
      style={[{ maxWidth: 112, minWidth: 112 }, style]}
      items={[
        {
          icon: 'visibility',
          selected: !hidden,
          onPress: () => {
            if (hidden) {
              if (!visibleGroupsSnackShown) {
                // eslint-disable-next-line react-compiler/react-compiler
                visibleGroupsSnackShown = true
                snack.show({
                  message: t('home.showingVisibleGroups'),
                  duration: snack.duration.SHORT,
                })
              }
              setHidden(false)
              onChange(false)
            }
          },
        },
        {
          icon: 'visibilityOff',
          selected: hidden,
          onPress: () => {
            if (!hidden) {
              if (!hiddenGroupsSnackShown) {
                // eslint-disable-next-line react-compiler/react-compiler
                hiddenGroupsSnackShown = true
                snack.show({
                  message: t('home.showingHiddenGroups'),
                  duration: snack.duration.SHORT,
                })
              }
              setHidden(true)
              onChange(true)
            }
          },
        },
      ]}
    />
  )
}

export default function Home() {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [fabRef, scrollHandler] = useFABScrollHandler()

  useNotificationPermission()

  const {
    groups: visibleGroups,
    isLoading: visibleGroupsLoading,
    hasNextPage: hasNextVisibleGroups,
    fetchNextPage: fetchNextVisibleGroups,
    isFetchingNextPage: isFetchingNextVisibleGroups,
    isRefetching: isRefetchingVisibleGroups,
    error: groupsError,
  } = useUserGroups(false)

  const {
    groups: hiddenGroups,
    isLoading: hiddenGroupsLoading,
    hasNextPage: hasNextHiddenGroups,
    fetchNextPage: fetchNextHiddenGroups,
    isFetchingNextPage: isFetchingNextHiddenGroups,
    isRefetching: isRefetchingHiddenGroups,
    error: hiddenGroupsError,
  } = useUserGroups(true)

  const { invites, isLoading: isLoadingInvites } = useUserGroupInvites(false)

  const [showHidden, setShowHidden] = useState(false)

  function refresh() {
    invalidateUserGroups()
    invalidateGroupInvites(true)
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
          }}
        >
          <FlatListWithHeader
            data={showHidden ? hiddenGroups : visibleGroups}
            refreshing={
              visibleGroupsLoading ||
              hiddenGroupsLoading ||
              isRefetchingVisibleGroups ||
              isRefetchingHiddenGroups
            }
            onRefresh={refresh}
            renderItem={({ item, index }) => (
              <GroupRow
                info={item}
                style={[
                  { borderRadius: 4 },
                  index === visibleGroups.length - 1 && {
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  },
                ]}
              />
            )}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 768,
              paddingHorizontal: 12,
              paddingBottom: 88 + insets.bottom,
              alignSelf: 'center',
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => `${item.id}-${item.hidden}`}
            scrollHandler={scrollHandler}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <View style={{ gap: 12 }}>
                <InvitationsButton invites={invites} isLoadingInvites={isLoadingInvites} />

                <FullPaneHeader
                  icon='group'
                  title={t('home.groups')}
                  textLocation='start'
                  rightComponentVisible
                  rightComponent={
                    <VisibilityFilter
                      onChange={(hidden) => {
                        setShowHidden(hidden)
                      }}
                    />
                  }
                />
              </View>
            }
            ListEmptyComponent={
              <ListEmptyComponent
                isLoading={showHidden ? hiddenGroupsLoading : visibleGroupsLoading}
                emptyText={
                  showHidden
                    ? t(hiddenGroupsError ? 'home.errorLoadingGroups' : 'home.noHiddenGroups')
                    : t(groupsError ? 'home.errorLoadingGroups' : 'home.noGroups')
                }
                loadingPlaceholder={<GroupsShimmer count={5} />}
              />
            }
            onEndReached={() => {
              if (!showHidden && !isFetchingNextVisibleGroups && hasNextVisibleGroups) {
                fetchNextVisibleGroups()
              }

              if (showHidden && !isFetchingNextHiddenGroups && hasNextHiddenGroups) {
                fetchNextHiddenGroups()
              }
            }}
          />
          <View style={{ position: 'absolute', right: 16, bottom: 16 + insets.bottom }}>
            <FloatingActionButton
              ref={fabRef}
              onPress={() => {
                router.navigate('/createGroup')
              }}
              title={t('home.createGroup')}
              icon='add'
            />
          </View>
        </View>
      </View>
    </View>
  )
}
