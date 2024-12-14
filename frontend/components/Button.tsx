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
}

export function Button({ title, onPress, leftIcon, rightIcon, isLoading }: ButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={(state) => {
        return {
          paddingVertical: 12,
          paddingHorizontal: title ? 24 : 12,
          borderRadius: 12,
          backgroundColor: theme.colors.primaryContainer,
          opacity: state.pressed ? 0.7 : 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 8,
        }
      }}
    >
      {isLoading && <ActivityIndicator size='small' color={theme.colors.onPrimaryContainer} />}
      {leftIcon && !isLoading && (
        <Icon name={leftIcon} size={24} color={theme.colors.onPrimaryContainer} />
      )}
      {title && (
        <Text
          selectable={false}
          style={{ fontSize: 16, fontWeight: '600', color: theme.colors.onPrimaryContainer }}
        >
          {title}
        </Text>
      )}
      {rightIcon && <Icon name={rightIcon} size={24} color={theme.colors.onPrimaryContainer} />}
    </Pressable>
  )
}
