import { Icon, IconName } from './Icon'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
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
  style?: (state: PressableStateCallbackType) => StyleProp<ViewStyle>
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
}: ButtonProps) {
  const theme = useTheme()

  const foregroundColor = destructive
    ? theme.colors.onErrorContainer
    : isLoading
      ? theme.colors.primary
      : theme.colors.onSurface

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={(state) => {
        return [
          {
            paddingVertical: 12,
            paddingHorizontal: title ? 24 : 12,
            borderRadius: 12,
            backgroundColor: destructive
              ? theme.colors.errorContainer
              : theme.colors.primaryContainer,
            opacity: disabled ? 0.5 : state.pressed ? 0.7 : 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
          },
          style?.(state),
        ]
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
    </Pressable>
  )
}
