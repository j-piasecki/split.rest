import { FloatingActionButton, useFABScrollHandler } from '@components/FloatingActionButton'
import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { PaneHeader } from '@components/Pane'
import { PullableFlatList } from '@components/PullableFlatList'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { useTheme } from '@styling/theme'
import { CurrencyUtils } from '@utils/CurrencyUtils'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroupInvites, invalidateUserGroups } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInfo, GroupInvite } from 'shared'

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
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: isSmallScreen ? 16 : 20,
        backgroundColor: theme.colors.surfaceContainer,
      }}
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
            flexDirection: isSmallScreen ? 'column-reverse' : 'row',
            gap: isSmallScreen ? 4 : 20,
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 16, color: balanceColor }}>
            {CurrencyUtils.format(info.balance, info.currency, true)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontSize: 16, color: theme.colors.outline }}>{info.memberCount}</Text>
              <Icon name='members' size={20} color={theme.colors.outline} />
            </View>

            <Icon
              name={info.isAdmin ? 'shield' : 'lock'}
              size={16}
              color={
                info.hasAccess && !info.isAdmin ? theme.colors.transparent : theme.colors.outline
              }
              style={{ transform: [{ translateY: 2 }] }}
            />
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
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? theme.colors.surfaceContainerHigh
          : theme.colors.surfaceContainer,
        borderRadius: 16,
      })}
      onPress={() => router.navigate('/groupInvites')}
    >
      {isLoadingInvites && (
        <ActivityIndicator color={theme.colors.onSurface} style={{ margin: 16 }} />
      )}
      {!isLoadingInvites && (
        <PaneHeader
          icon='stackedEmail'
          title={invites.length === 0 ? t('home.noGroupInvitesButton') : t('home.showGroupInvites')}
          textLocation='start'
          showSeparator={false}
          adjustsFontSizeToFit
          rightComponent={<Icon size={24} name={'chevronForward'} color={theme.colors.secondary} />}
        />
      )}
    </Pressable>
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
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <View style={{ gap: 16 }}>
                <InvitationsButton invites={invites} isLoadingInvites={isLoadingInvites} />

                <View
                  style={{
                    backgroundColor: theme.colors.surfaceContainer,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
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
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceContainer,
                  paddingVertical: 32,
                }}
              >
                {visibleGroupsLoading && <ActivityIndicator color={theme.colors.onSurface} />}
                {!visibleGroupsLoading && (
                  <Text style={{ color: theme.colors.outline, fontSize: 20 }}>
                    {showHidden ? t('home.noHiddenGroups') : t('home.noGroups')}
                  </Text>
                )}
              </View>
            }
            ListFooterComponent={
              <View
                style={{
                  height: 16,
                  backgroundColor: theme.colors.surfaceContainer,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
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
