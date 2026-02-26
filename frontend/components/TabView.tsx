import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

export interface Tab {
  icon: IconName
  title: string
  content: React.ReactNode
}

function TabButton({
  tab,
  selected,
  onPress,
  last,
}: {
  tab: Tab
  selected: boolean
  onPress: () => void
  last: boolean
}) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: withSpring(pressed ? 1.2 : 1, {
        mass: 1,
        stiffness: 200,
        damping: 12,
        energyThreshold: 0.0001,
      }),
    }
  })

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed ? 1.05 : 1, {
            mass: 1,
            stiffness: 200,
            damping: 12,
            energyThreshold: 0.0001,
          }),
        },
      ],
    }
  })

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable
        style={({ pressed, hovered }) => {
          return {
            backgroundColor: pressed
              ? theme.colors.surfaceContainerHigh
              : hovered || selected
                ? theme.colors.surfaceContainer
                : theme.colors.transparent,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderRightWidth: last ? 0 : 1,
            borderColor: theme.colors.outlineVariant,
          }
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
      >
        <Animated.View
          style={[
            animatedContentStyle,
            {
              flexDirection: 'row',
              gap: 8,
            },
          ]}
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
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {tab.title}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export interface TabViewProps {
  tabs: Tab[]
  openedTab: number
  onTabChange?: (index: number) => void
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

export function TabView(props: TabViewProps) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const [selectedItem, setSelectedItem] = useState(props.openedTab)

  useEffect(() => {
    setSelectedItem(props.openedTab)
  }, [props.openedTab])

  const item = Math.max(0, Math.min(selectedItem, props.tabs.length - 1))

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 12,
          overflow: 'hidden',
        },
        props.style,
      ]}
    >
      <View
        style={{
          width: '100%',
          height: threeBarLayout ? 40 : 48,
          flexDirection: 'row',
        }}
      >
        {props.tabs.map((tab, index) => {
          const selected = index === item

          return (
            <TabButton
              key={index}
              tab={tab}
              selected={selected}
              onPress={() => {
                setSelectedItem(index)
                props.onTabChange?.(index)
              }}
              last={index === props.tabs.length - 1}
            />
          )
        })}
      </View>

      <View
        key={item}
        style={[
          {
            width: '100%',
            flex: 1,
            padding: 8,
            backgroundColor: theme.colors.surfaceContainer,
          },
          props.contentContainerStyle,
        ]}
      >
        {props.tabs[item].content}
      </View>
    </View>
  )
}
