import Header from '@components/Header'
import { Tab, TabView } from '@components/TabView'
import { GroupInfoPage } from '@components/groupScreen/GroupInfoPage'
import { MembersList } from '@components/groupScreen/MembersList'
import { SplitsList } from '@components/groupScreen/SplitsList'
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useIsSmallScreen, useThreeBarLayout } from '@utils/dimensionUtils'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function ContentSwitcher({ info }: { info: GroupInfo | undefined }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const isSmallScreen = useIsSmallScreen()
  const [openedTab, setOpenedTab] = useState(0)

  useEffect(() => {
    if (threeBarLayout && openedTab === 2) {
      setOpenedTab(0)
    }
  }, [openedTab, threeBarLayout])

  const tabs: Tab[] = [
    {
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name='list-ul'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !isSmallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Splits
            </Text>
          )}
        </View>
      ),
      content: <SplitsList info={info} />,
    },
    {
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name='users'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !isSmallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Members
            </Text>
          )}
        </View>
      ),
      content: <MembersList info={info} />,
    },
  ]

  if (!threeBarLayout) {
    tabs.unshift({
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Entypo
            name='home'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !isSmallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Group
            </Text>
          )}
        </View>
      ),
      content: <GroupInfoPage info={info} />,
    })
  }

  return <TabView openedTab={openedTab} tabs={tabs} onTabChange={setOpenedTab} />
}

export default function GroupScreen() {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)
  const { data: groupInfo } = useGroupInfo(groupId)

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
