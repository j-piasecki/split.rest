import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'

export interface RoundIconButtonProps {
  icon: IconName
  onPress: (e: GestureResponderEvent) => void
  disabled?: boolean
  size?: number
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  containerStyle?: StyleProp<ViewStyle>
  color?: string
  isLoading?: boolean
  tabIndex?: 0 | -1
  text?: string
  opaque?: boolean
}

export function RoundIconButton({
  icon,
  onPress,
  disabled,
  size = 24,
  containerStyle,
  style,
  color,
  isLoading,
  tabIndex,
  text,
  opaque = false,
}: RoundIconButtonProps) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        pressed
          ? `${theme.colors.onSurface}33`
          : hovered
            ? opaque
              ? `${theme.colors.onSurface}22`
              : `${theme.colors.onSurface}11`
            : opaque
              ? `${theme.colors.onSurface}11`
              : 'transparent',
        { duration: 200 }
      ),
      transform: [
        {
          scale: withSpring(pressed ? (text ? 1.05 : 1.1) : 1, {
            mass: 1,
            stiffness: 250,
            damping: 10,
          }),
        },
      ],
    }
  })

  return (
    <Animated.View style={[containerAnimatedStyle, { borderRadius: 20 }, containerStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        tabIndex={tabIndex}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed, hovered }) => {
          const otherStyles =
            typeof style === 'function' ? style({ pressed, hovered }) : (style ?? {})
          return [
            {
              paddingVertical: 8,
              paddingHorizontal: text ? 16 : 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              userSelect: 'none',
              opacity: disabled ? 0.5 : 1,
            },
            otherStyles,
          ]
        }}
      >
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          {isLoading && <ActivityIndicator color={color ?? theme.colors.outline} />}
          {!isLoading && <Icon name={icon} size={size} color={color ?? theme.colors.outline} />}
        </View>
        {text && (
          <Text style={{ color: color ?? theme.colors.onSurface, fontWeight: 500, fontSize: 16 }}>
            {text}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}
