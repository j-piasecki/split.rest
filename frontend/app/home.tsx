import { Button } from '@components/Button'
import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { useUserGroups } from '@hooks/database/useUserGroups'
import { useTheme } from '@styling/theme'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function Group({ info }: { info: GroupInfo }) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={() => {
        router.navigate(`/group/${info.id}`)
      }}
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 16,
        marginVertical: 4,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'visible',
        backgroundColor: theme.colors.surfaceContainer,
      }}
    >
      <Text style={{ flex: 1, fontSize: 20, color: theme.colors.onSurface }}>{info.name}</Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={{ fontSize: 16, color: theme.colors.outline }}>{info.memberCount}</Text>
          <Icon name='members' size={20} color={theme.colors.outline} />
        </View>

        <Icon
          name='lock'
          size={16}
          color={info.hasAccess ? theme.colors.transparent : theme.colors.outline}
          style={{ transform: [{ translateY: 2 }] }}
        />
        <Icon
          name='shield'
          size={16}
          color={info.isAdmin ? theme.colors.outline : theme.colors.transparent}
          style={{ transform: [{ translateY: 2 }] }}
        />
        <Text style={{ fontSize: 16, color: theme.colors.outline }}>{info.currency}</Text>
      </View>
    </Pressable>
  )
}

function GroupList({ groups }: { groups: GroupInfo[] }) {
  return (
    <View style={{ marginTop: 8 }}>
      {groups.map((group) => (
        <Group info={group} key={group.id} />
      ))}
    </View>
  )
}

function HiddenGroupsButton({
  showHidden,
  setShowHidden,
}: {
  showHidden: boolean
  setShowHidden: (val: boolean) => void
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={() => {
        setShowHidden(!showHidden)
      }}
      style={({ pressed }) => {
        return {
          opacity: pressed ? 0.4 : 0.5,
        }
      }}
    >
      <View style={{ flex: 1, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: theme.colors.onSurfaceVariant }} />
        <Text
          style={{ marginHorizontal: 8, fontSize: 16, color: theme.colors.onSurfaceVariant }}
          selectable={false}
        >
          {showHidden ? t('hideHiddenGroups') : t('showHiddenGroups')}
        </Text>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: theme.colors.onSurfaceVariant }} />
      </View>
    </Pressable>
  )
}

export default function Home() {
  const theme = useTheme()
  const { t } = useTranslation()

  const {
    groups: groups,
    // isLoading: groupsLoading,
    // fetchNextPage: fetchNextGroups,
    // isFetchingNextPage: isFetchingNextGroups,
  } = useUserGroups(false)
  const {
    groups: hiddenGroups,
    // isLoading: hiddenGroupsLoading,
    // fetchNextPage: fetchNextHiddenGroups,
    // isFetchingNextPage: isFetchingNextHiddenGroups,
  } = useUserGroups(true)

  const [showHidden, setShowHidden] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceDim }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 768 }}>
          {groups && hiddenGroups && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 32 }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 28, color: theme.colors.onSurface }}>
                  {t('groupsText')}
                </Text>
                <Button
                  onPress={() => {
                    router.navigate('/createGroup')
                  }}
                  title={t('createGroup')}
                  leftIcon='add'
                />
              </View>
              <GroupList groups={groups} />

              {Boolean(hiddenGroups?.length) && (
                <HiddenGroupsButton showHidden={showHidden} setShowHidden={setShowHidden} />
              )}
              {showHidden && (
                <>
                  <Text style={{ fontSize: 28, color: theme.colors.onSurface }}>
                    {t('hiddenGroupsText')}
                  </Text>
                  <GroupList groups={hiddenGroups} />
                </>
              )}
            </ScrollView>
          )}

          {(!groups || !hiddenGroups) && (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size='small' color={theme.colors.onSurface} />
              <Text style={{ textAlign: 'center', color: theme.colors.onSurface }}>
                {t('loadingGroups')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
