import { Button } from './Button'
import { Icon } from './Icon'
import { Text } from './Text'
import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { ListEmptyComponent } from '@components/ListEmptyComponent'
import { FullPaneHeader } from '@components/Pane'
import { Shimmer } from '@components/Shimmer'
import { GroupRow } from '@components/homeScreen/GroupRow'
import { InvitationsButton } from '@components/homeScreen/InvitationsButton'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { useNotificationPermission } from '@hooks/useNotificationPermission'
import { useTheme } from '@styling/theme'
import { invalidateGroupInvites, invalidateUserGroups } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupUserInfo } from 'shared'

const HIDDEN_HEADER_KEY = '__hidden_header__'

type HiddenHeader = { type: 'hidden_header' }
type ListItem = GroupUserInfo | HiddenHeader

function isHiddenHeader(item: ListItem): item is HiddenHeader {
  return (item as HiddenHeader).type === 'hidden_header'
}

function Divider() {
  return <View style={{ width: '100%', height: 2, backgroundColor: 'transparent' }} />
}

function GroupsShimmer({ count }: { count: number }) {
  const theme = useTheme()

  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              {
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 8,
                paddingRight: 4,
                paddingVertical: 8,
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
              style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12, flexShrink: 0 }}
            />

            <View style={{ flex: 1, gap: 6, marginRight: 4 }}>
              <Shimmer
                offset={1 - index * 0.05 + 0.2}
                style={{ height: 18, borderRadius: 9, width: '70%' }}
              />
              <Shimmer
                offset={1 - index * 0.05 + 0.4}
                style={{ height: 18, borderRadius: 9, width: '35%' }}
              />
            </View>
          </View>
          {index !== count - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  )
}

export function HomeDrawerContent() {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

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
  } = useUserGroups(true)

  const { invites, isLoading: isLoadingInvites } = useUserGroupInvites(false)

  const [showHidden, setShowHidden] = useState(false)

  function refresh() {
    invalidateUserGroups()
    invalidateGroupInvites(true)
  }

  const hasHiddenGroups = hiddenGroups.length > 0 || hiddenGroupsLoading

  const data: ListItem[] = [
    ...visibleGroups,
    ...(hasHiddenGroups ? [{ type: 'hidden_header' } as HiddenHeader] : []),
    ...(showHidden && hasHiddenGroups ? hiddenGroups : []),
  ]

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%' }}>
          <FlatListWithHeader
            hideHeader
            data={data}
            isRefreshing={isRefetchingVisibleGroups || isRefetchingHiddenGroups}
            onRefresh={refresh}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              if (isHiddenHeader(item)) {
                return (
                  <Pressable
                    onPress={() => setShowHidden((prev) => !prev)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 4,
                      paddingVertical: 12,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: theme.colors.onSurfaceVariant,
                        letterSpacing: 0.5,
                      }}
                    >
                      {t('home.hiddenGroups')}
                    </Text>
                    <Icon
                      size={20}
                      name={showHidden ? 'arrowUp' : 'arrowDown'}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                )
              }

              const isLastVisible = index === visibleGroups.length - 1
              const isLastHidden = showHidden && index === data.length - 1
              // First hidden group follows the header separator — needs rounded top
              const isFirstVisible = index === 0
              const isFirstHidden = showHidden && index === visibleGroups.length + 1 // +1 for the header sentinel

              return (
                <GroupRow
                  info={item}
                  style={[
                    { borderRadius: 4 },
                    (isFirstHidden || isFirstVisible) && {
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    },
                    (isLastVisible || isLastHidden) && {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    },
                  ]}
                />
              )
            }}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 768,
              paddingTop: insets.top,
              paddingHorizontal: 12,
              paddingBottom: 88 + insets.bottom,
              alignSelf: 'center',
              flexGrow: 1,
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => {
              if (isHiddenHeader(item)) return HIDDEN_HEADER_KEY
              return `${item.id}-${item.hidden}`
            }}
            ItemSeparatorComponent={({ leadingItem }) => {
              if (isHiddenHeader(leadingItem)) return null
              return <Divider />
            }}
            ListHeaderComponent={
              <View style={{ gap: 12, paddingTop: 12, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: 600,
                      color: theme.colors.primary,
                      letterSpacing: 1,
                    }}
                  >
                    {t('appName')}
                  </Text>
                </View>

                <InvitationsButton invites={invites} isLoadingInvites={isLoadingInvites} />
              </View>
            }
            ListEmptyComponent={
              visibleGroupsLoading ? (
                <GroupsShimmer count={5} />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 24,
                    paddingHorizontal: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme.colors.onSurfaceVariant,
                      textAlign: 'center',
                    }}
                  >
                    {t(groupsError ? 'home.errorLoadingGroups' : 'home.noGroups')}
                  </Text>
                </View>
              )
            }
            onEndReached={() => {
              if (!isFetchingNextVisibleGroups && hasNextVisibleGroups) {
                fetchNextVisibleGroups()
              }
              if (showHidden && !isFetchingNextHiddenGroups && hasNextHiddenGroups) {
                fetchNextHiddenGroups()
              }
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 0,
              left: 0,
              bottom: 0,
              paddingBottom: insets.bottom + (Platform.OS === 'web' ? 16 : 0),
              paddingHorizontal: 16,
            }}
          >
            <Button
              style={{ flex: 1 }}
              leftIcon='add'
              onPress={() => {
                router.navigate('/createGroup')
              }}
              title={t('home.createGroup')}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
