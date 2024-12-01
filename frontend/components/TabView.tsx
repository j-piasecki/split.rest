import { useTheme } from '@styling/theme'
import React, { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

export interface Tab {
  header: (props: { selected: boolean }) => React.ReactNode
  content: () => React.ReactNode
}

export interface TabViewProps {
  openedTab: number
  tabs: Tab[]
  onTabChange?: (index: number) => void
  maxContentWidth?: number
}

export function TabView(props: TabViewProps) {
  const theme = useTheme()
  const [selectedItem, setSelectedItem] = useState(props.openedTab)

  useEffect(() => {
    setSelectedItem(props.openedTab)
  }, [props.openedTab])

  const item = Math.max(0, Math.min(selectedItem, props.tabs.length - 1))

  const Content = props.tabs[item].content

  return (
    <View style={{ width: '100%', flex: 1, alignItems: 'center' }}>
      <View style={{ width: '100%', height: 48, flexDirection: 'row' }}>
        {props.tabs.map((tab, index) => {
          const Header = props.tabs[index].header

          return (
            <Pressable
              key={index}
              style={({ pressed }) => {
                return {
                  backgroundColor: pressed
                    ? theme.colors.surfaceContainerHigh
                    : index === item
                      ? theme.colors.surfaceContainer
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
              <Header selected={index === item} />
            </Pressable>
          )
        })}
      </View>

      <View style={{ width: '100%', flex: 1, maxWidth: props.maxContentWidth }}>
        <Content />
      </View>
    </View>
  )
}
