import { measure } from '@utils/measure'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

export interface ShimmerProps {
  color: string
  style?: StyleProp<ViewStyle>
}

export function Shimmer({ color, style }: ShimmerProps) {
  const gradientRef = useRef<View>(null)
  const [width, setWidth] = useState(0)
  const progress = useSharedValue(-1)

  if (!/^#([A-Fa-f0-9]{6})$/.test(color)) {
    throw new Error('Color must be in hex rgba format')
  }

  const animatedStyles = useAnimatedStyle(() => {
    return {
      left: width * progress.value,
    }
  })

  const colorEdge = color + '00'
  const colorCenter = color

  useLayoutEffect(() => {
    if (gradientRef.current) {
      setWidth(measure(gradientRef.current).width)
    }
  }, [])

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1
    )
  }, [progress])

  return (
    <View
      style={[
        style,
        {
          overflow: 'hidden',
        },
      ]}
    >
      <View ref={gradientRef} style={[StyleSheet.absoluteFill]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyles]}>
          <LinearGradient
            style={[{ position: 'absolute', top: 0, bottom: 0, width: width }]}
            colors={[colorEdge, colorCenter, colorEdge]}
            locations={[0, 0.5, 1]}
            start={{
              x: 0,
              y: 0.5,
            }}
            end={{
              x: 1,
              y: 0.5,
            }}
          />
        </Animated.View>
      </View>
    </View>
  )
}
