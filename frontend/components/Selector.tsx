import { Icon, IconName } from '@components/Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAppLayout } from '@utils/dimensionUtils'
import React, { ReactNode, useState } from 'react'
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'

export interface SelectorItemProps {
  title: string
  description?: string
  icon?: IconName
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  collapsible?: boolean
  startExpanded?: boolean
  children?: ReactNode
  style?: ViewStyle
}

export function SelectorItem({
  title,
  description,
  icon,
  selected,
  onSelect,
  disabled,
  collapsible = true,
  startExpanded = false,
  children,
  style,
}: SelectorItemProps) {
  const theme = useTheme()
  const { threePaneLayout } = useAppLayout()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(startExpanded && collapsible)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(selected ? 0.9 : pressed ? 0.65 : hovered ? 0.3 : 0, {
        duration: 200,
      }),
    }
  })

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed ? 1.025 : 1, {
            damping: 40,
            stiffness: 500,
            energyThreshold: 0.0001,
          }),
        },
      ],
    }
  })

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onSelect}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            gap: 8,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            overflow: 'hidden',
            // @ts-expect-error - userSelect is not a valid style property
            userSelect: 'none',
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            animatedStyle,
            {
              backgroundColor: theme.colors.secondaryContainer,
            },
          ]}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          {icon && (
            <Icon
              name={icon}
              size={threePaneLayout.enabled ? 20 : 24}
              color={theme.colors.onSecondaryContainer}
            />
          )}
          <Text
            style={{
              fontSize: threePaneLayout.enabled ? 18 : 20,
              fontWeight: 800,
              color: theme.colors.onSecondaryContainer,
            }}
          >
            {title}
          </Text>

          {description && collapsible && (
            <View style={{ position: 'absolute', right: 0 }}>
              <RoundIconButton
                icon={expanded ? 'arrowUp' : 'arrowDown'}
                size={threePaneLayout.enabled ? 20 : 24}
                color={theme.colors.onSecondaryContainer}
                onPress={() => setExpanded(!expanded)}
              />
            </View>
          )}
        </View>
        {(expanded || !collapsible) && description && (
          <Text
            style={{
              marginLeft: icon ? 32 : 0,
              fontSize: threePaneLayout.enabled ? 14 : 16,
              fontWeight: 600,
              color: theme.colors.onSurface,
            }}
          >
            {description}
          </Text>
        )}
        {children}
      </Animated.View>
    </Pressable>
  )
}

export interface SelectorProps {
  children: ReactNode
  style?: ViewStyle
  gap?: number
}

export function Selector({ children, style, gap = 16 }: SelectorProps) {
  return <View style={[{ gap }, style]}>{children}</View>
}

Selector.Item = SelectorItem
