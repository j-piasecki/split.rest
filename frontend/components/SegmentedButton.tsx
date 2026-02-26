import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'

export interface SegmentedButtonItem {
  title?: string
  icon?: IconName
  selected?: boolean
  disabled?: boolean
  onPress?: () => void
}

export enum SegmentedButtonShowTitle {
  Always = 'always',
  Selected = 'selected',
  Never = 'never',
}

export interface SegmentedButtonProps {
  items: SegmentedButtonItem[]
  style?: StyleProp<ViewStyle>
  showTitle?: SegmentedButtonShowTitle
}

function Item({
  title,
  icon,
  selected,
  disabled,
  onPress,
  last,
  showTitle,
}: SegmentedButtonItem & { last: boolean; showTitle: SegmentedButtonShowTitle }) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const containerStyle = useAnimatedStyle(() => {
    return {
      flexGrow: withSpring(pressed ? 1.25 : 1, {
        mass: 1,
        stiffness: 250,
        damping: 12,
        energyThreshold: 0.0001,
      }),
    }
  })

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(selected ? 1 : pressed ? 0.5 : hovered ? 0.2 : 0, { duration: 200 }),
    }
  })

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(
            pressed ? (showTitle === SegmentedButtonShowTitle.Always ? 1.15 : 1.05) : 1,
            {
              mass: 1,
              stiffness: 250,
              damping: 15,
            }
          ),
        },
      ],
    }
  })

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        style={{
          flex: 1,
          paddingHorizontal: 8,
          borderRightWidth: last ? 0 : 1,
          borderColor: theme.colors.outline,
          opacity: disabled ? 0.5 : 1,

          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: disabled
                ? theme.colors.transparent
                : theme.colors.secondaryContainer,
            },
            backgroundStyle,
          ]}
        />
        <Animated.View
          style={[
            contentStyle,
            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
          ]}
        >
          {icon && (
            <Icon
              name={icon}
              size={18}
              color={selected ? theme.colors.onSecondaryContainer : theme.colors.onSurface}
            />
          )}
          {title &&
            (showTitle === SegmentedButtonShowTitle.Always ||
              (showTitle === SegmentedButtonShowTitle.Selected && selected)) && (
              <Text
                style={{
                  flexShrink: 1,
                  fontSize: 14,
                  color: selected ? theme.colors.onSecondaryContainer : theme.colors.onSurface,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {title}
              </Text>
            )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export function SegmentedButton({
  items,
  style,
  showTitle = SegmentedButtonShowTitle.Always,
}: SegmentedButtonProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          height: 40,
          flexDirection: 'row',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          overflow: 'hidden',
          // @ts-expect-error userSelect is not a valid prop for View
          userSelect: 'none',
        },
        style,
      ]}
    >
      {items.map((item, index) => {
        return (
          <Item key={index} {...item} last={index === items.length - 1} showTitle={showTitle} />
        )
      })}
    </View>
  )
}
