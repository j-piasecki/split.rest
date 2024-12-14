import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { Tab, TabView } from '@components/TabView'
import { GroupInfoPage } from '@components/groupScreen/GroupInfoPage'
import { MembersList } from '@components/groupScreen/MembersList'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function ContentSwitcher({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const isSmallScreen = useIsSmallScreen()
  const [openedTab, setOpenedTab] = useState(0)
  const { t } = useTranslation()
  useEffect(() => {
    if (threeBarLayout && openedTab === 2) {
      setOpenedTab(0)
    }
  }, [openedTab, threeBarLayout])

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

  if (!threeBarLayout) {
    tabs.unshift({
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
    })
  }

  return (
    <TabView
      openedTab={openedTab}
      tabs={tabs}
      onTabChange={setOpenedTab}
      headerLocation={threeBarLayout ? 'top' : 'bottom'}
    />
  )
}

export function GroupScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const threeBarLayout = useThreeBarLayout()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)
  const { data: groupInfo, error } = useGroupInfo(groupId)

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

      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
        {threeBarLayout && (
          <View style={{ flex: 1, height: '100%', backgroundColor: theme.colors.surfaceContainer }}>
            <GroupInfoPage info={groupInfo} />
          </View>
        )}
        <View style={{ flex: 2, height: '100%', alignItems: 'center' }}>
          <ContentSwitcher info={groupInfo} />
        </View>
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
