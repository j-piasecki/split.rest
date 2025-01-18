import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { PaneHeader } from '@components/Pane'
import { PullableFlatList } from '@components/PullableFlatList'
import { RoundIconButton } from '@components/RoundIconButton'
import { Shimmer } from '@components/Shimmer'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroupInvites, invalidateUserGroups } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInfo, GroupInvite } from 'shared'

const GROUP_ROW_HEIGHT = 80

function Group({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const balanceColor =
    Number(info.balance) === 0
      ? theme.colors.balanceNeutral
      : Number(info.balance) > 0
        ? theme.colors.balancePositive
        : theme.colors.balanceNegative

  return (
    <Pressable
      onPress={() => {
        router.navigate(`/group/${info.id}`)
      }}
      style={({ pressed, hovered }) => [
        {
          paddingHorizontal: 16,
          height: GROUP_ROW_HEIGHT,
          justifyContent: 'center',
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
        },
        styles.paneShadow,
      ]}
    >
      <View
        style={{
          opacity: info.hidden ? 0.7 : 1,
          gap: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ flex: 1, fontSize: 20, color: theme.colors.onSurface }} numberOfLines={2}>
          {info.name}
        </Text>

        <View
          style={{
            flexDirection: isSmallScreen ? 'column' : 'row',
            gap: isSmallScreen ? 4 : 20,
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 600, color: balanceColor }}>
            {CurrencyUtils.format(info.balance, info.currency, true)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontSize: 16, color: theme.colors.outline }}>{info.memberCount}</Text>
              <Icon name='members' size={20} color={theme.colors.outline} />
            </View>

            {(!isSmallScreen || !info.hasAccess || info.isAdmin) && (
              <Icon
                name={info.isAdmin ? 'shield' : 'lock'}
                size={16}
                color={
                  info.hasAccess && !info.isAdmin ? theme.colors.transparent : theme.colors.outline
                }
                style={{ transform: [{ translateY: 2 }] }}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  )
}

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

interface InvitationsButtonProps {
  invites: GroupInvite[]
  isLoadingInvites: boolean
}

function InvitationsButton({ invites, isLoadingInvites }: InvitationsButtonProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
          borderRadius: 16,
        },
        styles.paneShadow,
      ]}
      onPress={() => router.navigate('/groupInvites')}
    >
      <ShimmerPlaceholder
        argument={isLoadingInvites ? undefined : invites}
        style={{ height: 56 }}
        shimmerStyle={{ backgroundColor: theme.colors.surfaceContainer }}
      >
        {(invites) => (
          <PaneHeader
            icon='stackedEmail'
            title={
              invites.length === 0 ? t('home.noGroupInvitesButton') : t('home.showGroupInvites')
            }
            textLocation='start'
            showSeparator={false}
            adjustsFontSizeToFit
            rightComponent={
              <Icon size={24} name={'chevronForward'} color={theme.colors.secondary} />
            }
          />
        )}
      </ShimmerPlaceholder>
    </Pressable>
  )
}

function GroupsShimmer({ count }: { count: number }) {
  const isSmallScreen = useDisplayClass() === DisplayClass.Small

  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={{
              width: '100%',
              height: GROUP_ROW_HEIGHT,
              gap: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
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

export default function Home() {
  const theme = useTheme()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()
  const insets = useSafeAreaInsets()
  const [fabRef, scrollHandler] = useFABScrollHandler()

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
          <PullableFlatList
            data={showHidden ? hiddenGroups : visibleGroups}
            renderPullableHeader={(pullValue) => (
              <Header
                offset={pullValue}
                isWaiting={
                  visibleGroupsLoading ||
                  hiddenGroupsLoading ||
                  isRefetchingVisibleGroups ||
                  isRefetchingHiddenGroups
                }
                onPull={refresh}
              />
            )}
            renderItem={({ item }) => <Group info={item} />}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 768,
              paddingHorizontal: 16,
              paddingBottom: 80 + insets.bottom,
              alignSelf: 'center',
              paddingTop: displayClass <= DisplayClass.Medium ? 8 : 0,
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => `${item.id}-${item.hidden}`}
            onScroll={scrollHandler}
            onScrollEndDrag={scrollHandler}
            onMomentumScrollEnd={scrollHandler}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <View style={{ gap: 16 }}>
                <InvitationsButton invites={invites} isLoadingInvites={isLoadingInvites} />

                <View
                  style={[
                    {
                      backgroundColor: theme.colors.surfaceContainer,
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    },
                    styles.paneShadow,
                  ]}
                >
                  <PaneHeader
                    icon='group'
                    title={t('home.groups')}
                    textLocation='start'
                    rightComponentVisible
                    rightComponent={
                      <RoundIconButton
                        icon={showHidden ? 'visibilityOff' : 'visibility'}
                        onPress={() => setShowHidden((hidden) => !hidden)}
                      />
                    }
                  />
                </View>
              </View>
            }
            ListEmptyComponent={
              <View
                style={[
                  {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surfaceContainer,
                  },
                  styles.paneShadow,
                ]}
              >
                {visibleGroupsLoading && <GroupsShimmer count={7} />}
                {!visibleGroupsLoading && (
                  <Text style={{ color: theme.colors.outline, fontSize: 20, paddingVertical: 32 }}>
                    {showHidden
                      ? t(hiddenGroupsError ? 'home.errorLoadingGroups' : 'home.noHiddenGroups')
                      : t(groupsError ? 'home.errorLoadingGroups' : 'home.noGroups')}
                  </Text>
                )}
              </View>
            }
            ListFooterComponent={
              <View
                style={[
                  {
                    height: 16,
                    backgroundColor: theme.colors.surfaceContainer,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  },
                  styles.paneShadow,
                ]}
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
