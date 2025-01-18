import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

export interface ShimmerProps {
  color?: string
  style?: StyleProp<ViewStyle>
  offset?: number
}

export function Shimmer({ color, style, offset = 0 }: ShimmerProps) {
  const theme = useTheme()
  const gradientRef = useRef<View>(null)
  const [width, setWidth] = useState(0)
  const progress = useSharedValue(0)

  const colorToUse = color ?? theme.colors.surfaceContainerHighest

  if (!/^#([A-Fa-f0-9]{6})$/.test(colorToUse)) {
    throw new Error('Color must be in hex rgba format')
  }

  const animatedStyles = useAnimatedStyle(() => {
    const progressWithOffset = Easing.inOut(Easing.ease)((progress.value + offset) % 1)
    const left = interpolate(progressWithOffset, [0, 1], [-width, width], 'clamp')

    return {
      left: left,
    }
  })

  const colorEdge = colorToUse + '00'
  const colorCenter = colorToUse

  useLayoutEffect(() => {
    if (gradientRef.current) {
      setWidth(measure(gradientRef.current).width)
    }
  }, [])

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1)
  }, [progress])

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceContainerHigh,
        },
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
