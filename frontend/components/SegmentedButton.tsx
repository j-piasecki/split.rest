import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

export interface SegmentedButtonItem {
  title?: string
  icon?: IconName
  selected?: boolean
  disabled?: boolean
  onPress?: () => void
}

export interface SegmentedButtonProps {
  items: SegmentedButtonItem[]
  style?: StyleProp<ViewStyle>
}

function Item({
  title,
  icon,
  selected,
  disabled,
  onPress,
  last,
}: SegmentedButtonItem & { last: boolean }) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      style={{
        flex: 1,
        paddingHorizontal: 8,
        borderRightWidth: last ? 0 : 1,
        borderColor: theme.colors.outline,
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: disabled ? theme.colors.transparent : theme.colors.secondaryContainer,
            opacity: selected ? 1 : pressed ? 0.5 : hovered ? 0.2 : 0,
          },
        ]}
      />
      {icon && (
        <Icon
          name={icon}
          size={18}
          color={selected ? theme.colors.onSecondaryContainer : theme.colors.onSurface}
        />
      )}
      {title && (
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
    </Pressable>
  )
}

export function SegmentedButton({ items, style }: SegmentedButtonProps) {
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
        },
        style,
      ]}
    >
      {items.map((item, index) => {
        return <Item key={index} {...item} last={index === items.length - 1} />
      })}
    </View>
  )
}
