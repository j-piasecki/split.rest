import { Icon, IconName } from './Icon'
import { Text } from '@components/Text'
import { buttonCornerSpringConfig, buttonPaddingSpringConfig } from '@styling/animationConfigs'
import { useTheme } from '@styling/theme'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

export interface ButtonProps {
  title?: string
  onPress?: () => void
  leftIcon?: IconName
  rightIcon?: IconName
  isLoading?: boolean
  destructive?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  foregroundColor?: string
  children?: React.ReactNode
}

export function Button({
  title,
  onPress,
  leftIcon,
  rightIcon,
  isLoading,
  destructive,
  disabled,
  style,
  foregroundColor: foregroundColorProp,
  children,
}: ButtonProps) {
  const theme = useTheme()
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const foregroundColor =
    foregroundColorProp ??
    (destructive
      ? theme.colors.onErrorContainer
      : isLoading
        ? theme.colors.primary
        : theme.colors.onPrimaryContainer)

  const outerAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderRadius: withSpring(isPressed ? 28 : 12, buttonCornerSpringConfig),
    }
  })

  const innerAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingTop: withSpring(isPressed ? 16 : 12, buttonPaddingSpringConfig),
      paddingBottom: withSpring(isPressed ? 16 : 12, buttonPaddingSpringConfig),
    }
  })

  return (
    <Animated.View
      style={[
        outerAnimatedStyle,
        {
          backgroundColor: destructive
            ? theme.colors.errorContainer
            : theme.colors.primaryContainer,
        },
        typeof style === 'function'
          ? style({
              pressed: isPressed,
              hovered: isHovered,
            })
          : style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={(state) => {
          return {
            opacity: disabled ? 0.5 : state.pressed ? 0.8 : state.hovered ? 0.9 : 1,
            backgroundColor: state.pressed
              ? `${theme.colors.surface}44`
              : state.hovered
                ? `${theme.colors.surface}22`
                : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }
        }}
      >
        <Animated.View
          style={[
            innerAnimatedStyle,
            {
              paddingHorizontal: title ? 24 : 12,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
            },
          ]}
        >
          {isLoading && <ActivityIndicator size='small' color={foregroundColor} />}
          {leftIcon && !isLoading && <Icon name={leftIcon} size={24} color={foregroundColor} />}
          {title !== undefined && title.length > 0 && (
            <Text
              selectable={false}
              style={{ fontSize: 18, fontWeight: '700', color: foregroundColor }}
            >
              {title}
            </Text>
          )}
          {rightIcon && <Icon name={rightIcon} size={24} color={foregroundColor} />}
        </Animated.View>
        {children}
      </Pressable>
    </Animated.View>
  )
}
