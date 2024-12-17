import { Icon } from './Icon'
import { IconName } from './Icon'
import { useTheme } from '@styling/theme'
import {
  GestureResponderEvent,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native'

export interface RoundIconButtonProps {
  icon: IconName
  onPress: (e: GestureResponderEvent) => void
  disabled?: boolean
  size?: number
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  color?: string
}

export function RoundIconButton({
  icon,
  onPress,
  disabled,
  size = 24,
  style,
  color,
}: RoundIconButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed, hovered }) => {
        const otherStyles =
          typeof style === 'function' ? style({ pressed, hovered }) : (style ?? {})
        return [
          {
            backgroundColor: pressed
              ? theme.colors.surfaceContainerHigh
              : hovered
                ? theme.colors.surfaceContainer
                : 'transparent',
            padding: 8,
            borderRadius: 20,
          },
          otherStyles,
        ]
      }}
    >
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={icon} size={size} color={color ?? theme.colors.outline} />
      </View>
    </Pressable>
  )
}
