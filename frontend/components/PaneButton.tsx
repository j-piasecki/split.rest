import { Icon, IconName } from '@components/Icon'
import { PaneHeader } from '@components/Pane'
import { useTheme } from '@styling/theme'
import React from 'react'
import { Pressable } from 'react-native'

export interface PaneButtonProps {
  onPress: () => void
  icon: IconName
  title: string
  adjustsFontSizeToFit?: boolean
  rightComponent?: React.ReactNode
}

export function PaneButton({
  onPress,
  icon,
  title,
  adjustsFontSizeToFit = true,
  rightComponent,
}: PaneButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
          borderRadius: 16,
        },
      ]}
      onPress={onPress}
    >
      <PaneHeader
        icon={icon}
        title={title}
        textLocation='start'
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        rightComponent={
          <>
            {rightComponent}
            <Icon size={24} name={'chevronForward'} color={theme.colors.secondary} />
          </>
        }
      />
    </Pressable>
  )
}
