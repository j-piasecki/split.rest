import { useTheme } from '@styling/theme'
import React, { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface Tab {
  header: (props: { selected: boolean }) => React.ReactNode
  content: React.ReactNode
}

export interface TabViewProps {
  openedTab: number
  tabs: Tab[]
  onTabChange?: (index: number) => void
  maxContentWidth?: number
  headerLocation?: 'top' | 'bottom'
}

export function TabView(props: TabViewProps) {
  const theme = useTheme()
  const [selectedItem, setSelectedItem] = useState(props.openedTab)
  const insets = useSafeAreaInsets()

  const headerLocation = props.headerLocation ?? 'top'
  const bottomInset = headerLocation === 'bottom' ? insets.bottom : 0

  useEffect(() => {
    setSelectedItem(props.openedTab)
  }, [props.openedTab])

  const item = Math.max(0, Math.min(selectedItem, props.tabs.length - 1))

  return (
    <View style={{ width: '100%', flex: 1, alignItems: 'center' }}>
      {headerLocation === 'bottom' && (
        <View style={{ width: '100%', flex: 1, maxWidth: props.maxContentWidth }}>
          {props.tabs[item].content}
        </View>
      )}

      <View
        style={{
          width: '100%',
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          flexDirection: 'row',
          backgroundColor: theme.colors.surfaceContainer,
        }}
      >
        {props.tabs.map((tab, index) => {
          const Header = props.tabs[index].header

          return (
            <Pressable
              key={index}
              style={({ pressed }) => {
                return {
                  backgroundColor: pressed
                    ? theme.colors.surfaceContainerHigh
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

      {headerLocation === 'top' && (
        <View style={{ width: '100%', flex: 1, maxWidth: props.maxContentWidth }}>
          {props.tabs[item].content}
        </View>
      )}
    </View>
  )
}
