import { Button } from '@components/Button'
import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { PaneHeader } from '@components/groupScreen/Pane'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { useTheme } from '@styling/theme'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { router } from 'expo-router'
import React, { useMemo } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInfo } from 'shared'

function Group({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()
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
          opacity: info.hidden ? 0.5 : 1,
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
            {info.balance} {info.currency}
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

export default function Home() {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const {
    groups: visibleGroups,
    isLoading: visibleGroupsLoading,
    hasNextPage: hasNextVisibleGroups,
    fetchNextPage: fetchNextVisibleGroups,
    isFetchingNextPage: isFetchingNextVisibleGroups,
  } = useUserGroups(false)

  const {
    groups: hiddenGroups,
    isLoading: _hiddenGroupsLoading,
    hasNextPage: hasNextHiddenGroups,
    fetchNextPage: fetchNextHiddenGroups,
    isFetchingNextPage: isFetchingNextHiddenGroups,
  } = useUserGroups(true)

  const [showHidden, setShowHidden] = useState(false)

  const groups = useMemo(() => {
    if (!showHidden) {
      return visibleGroups
    }

    const result = [...visibleGroups, ...hiddenGroups]
    result.sort((a, b) => b.id - a.id)
    return result
  }, [visibleGroups, hiddenGroups, showHidden])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 768,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          <FlatList
            data={groups}
            renderItem={({ item }) => <Group info={item} />}
            contentContainerStyle={{
              paddingBottom: 80 + insets.bottom,
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <View
                style={{
                  backgroundColor: theme.colors.surfaceContainer,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <PaneHeader
                  icon='group'
                  title={t('groupsText')}
                  textLocation='start'
                  rightComponentVisible={hiddenGroups.length !== 0}
                  rightComponent={
                    <RoundIconButton
                      icon={showHidden ? 'visibilityOff' : 'visibility'}
                      onPress={() => setShowHidden((hidden) => !hidden)}
                    />
                  }
                />
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
                    {t('noGroupsText')}
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
              if (!isFetchingNextVisibleGroups && hasNextVisibleGroups) {
                fetchNextVisibleGroups()
              }

              if (showHidden && !isFetchingNextHiddenGroups && hasNextHiddenGroups) {
                fetchNextHiddenGroups()
              }
            }}
          />
          <View style={{ position: 'absolute', right: 16, bottom: 16 + insets.bottom }}>
            <Button
              onPress={() => {
                router.navigate('/createGroup')
              }}
              title={t('createGroup')}
              leftIcon='add'
            />
          </View>
        </View>
      </View>
    </View>
  )
}
