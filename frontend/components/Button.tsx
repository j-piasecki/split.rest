import { Icon, IconName } from './Icon'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native'

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
}: ButtonProps) {
  const theme = useTheme()

  const foregroundColor =
    foregroundColorProp ??
    (destructive
      ? theme.colors.onErrorContainer
      : isLoading
        ? theme.colors.primary
        : theme.colors.onPrimaryContainer)

  return (
    // TODO: move props styles to the container View?
    <View
      style={{
        borderRadius: 12,
        backgroundColor: destructive ? theme.colors.errorContainer : theme.colors.primaryContainer,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        style={(state) => {
          return [
            {
              opacity: disabled ? 0.5 : state.pressed ? 0.8 : state.hovered ? 0.9 : 1,
              backgroundColor: state.pressed
                ? `${theme.colors.surface}44`
                : state.hovered
                  ? `${theme.colors.surface}22`
                  : 'transparent',
            },
            typeof style === 'function' ? style(state) : style,
          ]
        }}
      >
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: title ? 24 : 12,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
          }}
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
        </View>
      </Pressable>
    </View>
  )
}
