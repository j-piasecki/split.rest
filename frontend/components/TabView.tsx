import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'

export interface Tab {
  icon: IconName
  title: string
  content: React.ReactNode
}

export interface TabViewProps {
  tabs: Tab[]
  openedTab: number
  onTabChange?: (index: number) => void
  style?: StyleProp<ViewStyle>
}

export function TabView(props: TabViewProps) {
  const theme = useTheme()
  const [selectedItem, setSelectedItem] = useState(props.openedTab)

  useEffect(() => {
    setSelectedItem(props.openedTab)
  }, [props.openedTab])

  const item = Math.max(0, Math.min(selectedItem, props.tabs.length - 1))

  return (
    <View
      style={[
        { borderWidth: 1, borderColor: theme.colors.outlineVariant, borderRadius: 12 },
        props.style,
      ]}
    >
      <View
        style={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
        }}
      >
        {props.tabs.map((tab, index) => {
          const selected = index === item

          return (
            <Pressable
              key={index}
              style={({ pressed, hovered }) => {
                return {
                  backgroundColor: pressed
                    ? theme.colors.surfaceContainerHighest
                    : hovered || selected
                      ? theme.colors.surfaceContainerHigh
                      : theme.colors.transparent,
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTopLeftRadius: index === 0 ? 12 : 0,
                  borderTopRightRadius: index === props.tabs.length - 1 ? 12 : 0,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                }
              }}
              onPress={() => {
                setSelectedItem(index)
                props.onTabChange?.(index)
              }}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={selected ? theme.colors.primary : theme.colors.outline}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: selected ? theme.colors.primary : theme.colors.outline,
                  marginLeft: 8,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {tab.title}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View key={item} style={{ width: '100%', flex: 1, padding: 8 }}>
        {props.tabs[item].content}
      </View>
    </View>
  )
}
