import { Icon } from './Icon'
import { IconName } from './Icon'
import { useTheme } from '@styling/theme'
import {
  ActivityIndicator,
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
  isLoading?: boolean
  tabIndex?: 0 | -1
}

export function RoundIconButton({
  icon,
  onPress,
  disabled,
  size = 24,
  style,
  color,
  isLoading,
  tabIndex,
}: RoundIconButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      tabIndex={tabIndex}
      style={({ pressed, hovered }) => {
        const otherStyles =
          typeof style === 'function' ? style({ pressed, hovered }) : (style ?? {})
        return [
          {
            backgroundColor: pressed
              ? `${theme.colors.onSurface}33`
              : hovered
                ? `${theme.colors.onSurface}11`
                : 'transparent',
            padding: 8,
            borderRadius: 20,
          },
          otherStyles,
        ]
      }}
    >
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {isLoading && <ActivityIndicator color={color ?? theme.colors.outline} />}
        {!isLoading && <Icon name={icon} size={size} color={color ?? theme.colors.outline} />}
      </View>
    </Pressable>
  )
}
