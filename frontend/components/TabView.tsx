import { useTheme } from '@styling/theme'
import React, { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

interface Tab {
  header: () => React.ReactNode
  content: () => React.ReactNode
}

export interface TabViewProps {
  openedTab: number
  tabs: Tab[]
  onTabChange?: (index: number) => void
}

export function TabView(props: TabViewProps) {
  const theme = useTheme()
  const [selectedItem, setSelectedItem] = useState(props.openedTab)

  useEffect(() => {
    setSelectedItem(props.openedTab)
  }, [props.openedTab])

  const Content = props.tabs[selectedItem].content

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <View style={{ width: '100%', height: 40, flexDirection: 'row' }}>
        {props.tabs.map((tab, index) => {
          const Header = props.tabs[index].header

          return (
            <Pressable
              key={index}
              style={({ pressed }) => {
                return {
                  backgroundColor: pressed
                    ? theme.colors.surfaceContainer
                    : index === selectedItem
                      ? theme.colors.surfaceContainerLow
                      : theme.colors.transparent,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              }}
              onPress={() => {
                setSelectedItem(index)
                props.onTabChange?.(index)
              }}
            >
              <Header />
            </Pressable>
          )
        })}
      </View>

      <Content />
    </View>
  )
}
