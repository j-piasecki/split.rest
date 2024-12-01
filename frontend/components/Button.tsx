import { useTheme } from '@styling/theme'
import React from 'react'
import { Pressable, Text } from 'react-native'

export interface ButtonProps {
  title: string
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
          paddingHorizontal: 24,
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
      <Text selectable={false} style={{ color: theme.colors.onPrimaryContainer }}>
        {title}
      </Text>
      {rightIcon && rightIcon}
    </Pressable>
  )
}
