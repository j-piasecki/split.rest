import { Icon, IconName } from './Icon'
import { useTheme } from '@styling/theme'
import React from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

export interface ButtonProps {
  title?: string
  onPress?: () => void
  leftIcon?: IconName
  rightIcon?: IconName
  isLoading?: boolean
  destructive?: boolean
}

export function Button({
  title,
  onPress,
  leftIcon,
  rightIcon,
  isLoading,
  destructive,
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
      style={(state) => {
        return {
          paddingVertical: 12,
          paddingHorizontal: title ? 24 : 12,
          borderRadius: 12,
          backgroundColor: destructive
            ? theme.colors.errorContainer
            : theme.colors.primaryContainer,
          opacity: state.pressed ? 0.7 : 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
        }
      }}
    >
      {isLoading && <ActivityIndicator size='small' color={foregroundColor} />}
      {leftIcon && !isLoading && <Icon name={leftIcon} size={24} color={foregroundColor} />}
      {title && (
        <Text
          selectable={false}
          style={{ fontSize: 16, fontWeight: '600', color: foregroundColor }}
        >
          {title}
        </Text>
      )}
      {rightIcon && <Icon name={rightIcon} size={24} color={foregroundColor} />}
    </Pressable>
  )
}
