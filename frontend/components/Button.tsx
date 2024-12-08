import { useTheme } from '@styling/theme'
import React from 'react'
import { Pressable, Text } from 'react-native'

export interface ButtonProps {
  title?: string
  onPress?: () => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({ title, onPress, leftIcon, rightIcon }: ButtonProps) {
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
      {leftIcon && leftIcon}
      {title && (
        <Text
          selectable={false}
          style={{ fontSize: 16, fontWeight: '600', color: theme.colors.onPrimaryContainer }}
        >
          {title}
        </Text>
      )}
      {rightIcon && rightIcon}
    </Pressable>
  )
}
