import { StyleProp, ViewStyle } from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

export interface KeyboardAvoidingViewProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function KeyboardAvoidingView({ children, style }: KeyboardAvoidingViewProps) {
  const { height } = useReanimatedKeyboardAnimation()

  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: Math.abs(height.value),
    }
  })

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}
