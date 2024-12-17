import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { Tab, TabView } from '@components/TabView'
import { Text } from '@components/Text'
import { GroupInfoPage } from '@components/groupScreen/GroupInfoPage'
import { MembersList } from '@components/groupScreen/MembersList'
import { Pane } from '@components/groupScreen/Pane'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { GroupInfo } from 'shared'

function ContentSwitcher({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const isSmallScreen = useIsSmallScreen()
  const [openedTab, setOpenedTab] = useState(0)
  const { t } = useTranslation()

  const tabs: Tab[] = [
    {
      header: ({ selected }) => (
        <View
          style={{
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name='home'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          <Text
            style={{
              color: selected ? theme.colors.primary : theme.colors.outline,
              marginLeft: isSmallScreen ? 0 : 8,
              fontSize: isSmallScreen ? 12 : 16,
            }}
          >
            {t('tabs.group')}
          </Text>
        </View>
      ),
      content: <GroupInfoPage info={info} />,
    },
    {
      header: ({ selected }) => (
        <View
          style={{
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name='receipt'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          <Text
            style={{
              color: selected ? theme.colors.primary : theme.colors.outline,
              marginLeft: isSmallScreen ? 0 : 8,
              fontSize: isSmallScreen ? 12 : 16,
            }}
          >
            {t('tabs.splits')}
          </Text>
        </View>
      ),
      content: <SplitsList info={info} />,
    },
    {
      header: ({ selected }) => (
        <View
          style={{
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name='members'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          <Text
            style={{
              color: selected ? theme.colors.primary : theme.colors.outline,
              marginLeft: isSmallScreen ? 0 : 8,
              fontSize: isSmallScreen ? 12 : 16,
            }}
          >
            {t('tabs.members')}
          </Text>
        </View>
      ),
      content: <MembersList info={info} />,
    },
  ]

  return (
    <TabView
      openedTab={openedTab}
      tabs={tabs}
      onTabChange={setOpenedTab}
      headerLocation={'bottom'}
    />
  )
}

export function GroupScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const threeBarLayout = useThreeBarLayout()
  const groupId = Number(id as string)
  const { width } = useWindowDimensions()
  const { data: groupInfo, error } = useGroupInfo(groupId)

  const [membersExpanded, setMembersExpanded] = useState(false)
  const membersAlwaysExpanded = width > 1600

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {t('groupInfo.couldNotLoad')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        {!threeBarLayout && <ContentSwitcher info={groupInfo} />}

        {threeBarLayout && (
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingBottom: 16,
              gap: 16,
            }}
          >
            <Pane icon='home' title={t('tabs.group')} style={{ minWidth: 420 }}>
              <GroupInfoPage info={groupInfo} />
            </Pane>
            <Pane icon='receipt' title={t('tabs.splits')} style={{ flex: 2 }}>
              <SplitsList info={groupInfo} />
            </Pane>
            <Pane
              icon='members'
              title={t('tabs.members')}
              collapsable={!membersAlwaysExpanded}
              collapsed
              onCollapseChange={() => {
                setMembersExpanded(!membersExpanded)
              }}
            >
              <MembersList info={groupInfo} iconOnly={!membersAlwaysExpanded} />
            </Pane>

            {!membersAlwaysExpanded && (
              <Modal
                visible={membersExpanded}
                transparent
                onRequestClose={() => {
                  setMembersExpanded(false)
                }}
              >
                <Pressable
                  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
                  onPress={() => {
                    setMembersExpanded(false)
                  }}
                />
                <View
                  style={{
                    width: 600,
                    bottom: 16,
                    top: 60,
                    right: 16,
                    position: 'absolute',
                    backgroundColor: theme.colors.surfaceContainer,
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}
                >
                  <Pane
                    icon='members'
                    title={t('tabs.members')}
                    collapsable
                    onCollapseChange={() => {
                      setMembersExpanded(false)
                    }}
                  >
                    <MembersList info={groupInfo} />
                  </Pane>
                </View>
              </Modal>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default function GroupScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return <GroupScreen />
}
