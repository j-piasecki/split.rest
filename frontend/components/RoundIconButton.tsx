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
}

export function RoundIconButton({
  icon,
  onPress,
  disabled,
  size = 24,
  style,
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
        <Icon name={icon} size={size} color={theme.colors.outline} />
      </View>
    </Pressable>
  )
}

{
  /* <Pressable
  disabled={contextMenuDisabled}
  onPress={(e) => {
    contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
  }}
  style={({ pressed, hovered }) => ({
    width: 40,
    height: 40,
    backgroundColor: pressed
      ? theme.colors.surfaceContainerHigh
      : hovered
        ? theme.colors.surfaceContainer
        : 'transparent',
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    opacity: contextMenuDisabled ? 0 : 1,
  })}
>
  <Icon name='moreVertical' size={24} color={theme.colors.outline} />
</Pressable> */
}
