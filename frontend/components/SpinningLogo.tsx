import { useTheme } from '@styling/theme'
import { Image } from 'expo-image'
import { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
} from 'react-native-reanimated'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon.svg')

export interface SpinningLogoProps {
  size?: number
}

export function SpinningLogo({ size = 64 }: SpinningLogoProps) {
  const theme = useTheme()
  const progress = useSharedValue(0)

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${progress.value * 360}deg` },
      { scale: 1.2 - Math.abs(progress.value - 0.5) * 0.4 },
    ],
  }))

  useEffect(() => {
    progress.value = withRepeat(withSpring(1, { damping: 40, stiffness: 180 }), -1, false)
  }, [progress])

  return (
    <Animated.View style={style}>
      <Image source={icon} style={{ width: size, height: size }} tintColor={theme.colors.primary} />
    </Animated.View>
  )
}
