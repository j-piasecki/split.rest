import { Icon } from './Icon'
import { ProfilePicture } from './ProfilePicture'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { HapticFeedback } from '@utils/hapticFeedback'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { Pressable, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const HEADER_HEIGHT = 68

export interface HeaderProps {
  offset?: SharedValue<number>
  isWaiting?: boolean
  onPull?: () => void
  showBackButton?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon.svg')

function feedback() {
  HapticFeedback.pullDownActive()
}

export default function Header({ offset, isWaiting, onPull, showBackButton }: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const isRotating = useSharedValue(false)
  const rotationCounter = useSharedValue(0)
  const isWaitingSV = useSharedValue(isWaiting ?? false)
  const rotation = useSharedValue(0)
  const { width } = useWindowDimensions()

  const backButtonVisible =
    (Platform.OS === 'ios' || Platform.OS === 'web') &&
    (showBackButton || displayClass > DisplayClass.Medium)

  const spin = useCallback(() => {
    'worklet'

    if (rotation.value % 360 === 0 || rotation.value > 180) {
      rotationCounter.value++
      isRotating.value = true
      rotation.value = withSpring(
        360 * rotationCounter.value,
        { damping: 35, stiffness: 120 },
        () => {
          if (rotation.value % 360 === 0) {
            isRotating.value = false
          }
        }
      )
    }
  }, [isRotating, rotation, rotationCounter])

  useAnimatedReaction(
    () => (offset?.value ?? 0) < -100,
    (value, previous) => {
      if (value && !previous) {
        runOnJS(feedback)()
      }

      if (!value && previous && !isWaitingSV.value) {
        spin()

        if (onPull) {
          runOnJS(onPull)()
        }
      }
    }
  )

  useAnimatedReaction<[boolean, boolean, number]>(
    () => [isRotating.value, isWaitingSV.value, rotation.value],
    ([isRotating, isWaiting, rotation]) => {
      if (!isRotating && isWaiting && rotation % 360 === 0) {
        spin()
      }
    }
  )

  useEffect(() => {
    isWaitingSV.value = isWaiting ?? false
  }, [isRotating, isWaiting, isWaitingSV, spin])

  const animatedStyle = useAnimatedStyle(() => {
    const normalizedOffset = Math.abs(Math.min(offset?.value ?? 0, 0))
    const size = Math.pow(normalizedOffset, 0.85)

    return {
      transform: [
        {
          scale: 0.5 + size / 96 + 0.125 - Math.sin(Math.abs((rotation.value % 360) - 180) / 1440),
        },
        { translateY: size / 1.25 },
        { rotate: `${rotation.value + Math.sqrt(normalizedOffset)}deg` },
      ],
      width: 96,
      height: 96,
      left: -48 + width / 2,
      bottom: -10,
    }
  })

  const offsetStyle = useAnimatedStyle(() => {
    const normalizedOffset = Math.abs(Math.min(offset?.value ?? 0, 0))

    return {
      opacity: Math.max(0, 1 - normalizedOffset / 200),
      transform: [{ translateY: normalizedOffset / 2 }],
    }
  })

  return (
    <View
      style={{
        height: HEADER_HEIGHT + insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top,
        paddingBottom: 8,
        zIndex: 100,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Pressable
        disabled={!backButtonVisible}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        onPress={() => {
          if (router.canGoBack()) {
            router.back()
          } else {
            router.navigate('/home')
          }
        }}
      >
        <Animated.View
          style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, offsetStyle]}
        >
          {backButtonVisible && (
            <Icon
              name='chevronBack'
              size={24}
              color={theme.colors.primary}
              style={{ opacity: showBackButton ? 1 : 0 }}
            />
          )}
          <Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: theme.colors.primary,
              letterSpacing: 1,
            }}
          >
            {t('appName')}
          </Text>
        </Animated.View>
      </Pressable>

      <GestureDetector
        gesture={Gesture.Tap()
          .runOnJS(true)
          .enabled(onPull !== undefined)
          .onStart(() => onPull?.())}
      >
        {/* don't animate the image directly, it causes it to be recreated every frame on ios */}
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
          <Image source={icon} style={{ width: 96, height: 96 }} tintColor={theme.colors.primary} />
        </Animated.View>
      </GestureDetector>

      <Animated.View style={offsetStyle}>
        <Pressable
          onPress={() => router.navigate('/profile')}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ProfilePicture user={user ?? undefined} size={32} />
        </Pressable>
      </Animated.View>
    </View>
  )
}
