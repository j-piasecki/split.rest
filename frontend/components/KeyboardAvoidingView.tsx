import { StyleProp, ViewStyle } from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

export interface KeyboardAvoidingViewProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  reduceInset?: number
}

export function KeyboardAvoidingView({ children, style, reduceInset }: KeyboardAvoidingViewProps) {
  const { height } = useReanimatedKeyboardAnimation()

  const animatedStyle = useAnimatedStyle(() => {
    const inset = Math.abs(height.value)
    return {
      paddingBottom: inset - (reduceInset && inset > 0 ? reduceInset : 0),
    }
  })

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}
