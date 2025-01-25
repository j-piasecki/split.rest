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

const SHOW_ROTATION = true

export interface HeaderProps {
  offset?: SharedValue<number>
  isWaiting?: boolean
  onPull?: () => void
  showBackButton?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon.svg')

function feedback() {
  HapticFeedback.impactLight()
}

export default function Header({ offset, isWaiting, onPull, showBackButton }: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const isRotating = useSharedValue(false)
  const isWaitingSV = useSharedValue(isWaiting ?? false)
  const rotation = useSharedValue(0)
  const { width } = useWindowDimensions()

  const spin = useCallback(() => {
    'worklet'

    if (SHOW_ROTATION) {
      isRotating.value = true
      rotation.value = withSpring(360, { damping: 10, stiffness: 40 }, () => {
        rotation.value = 0
        isRotating.value = false
      })
    }
  }, [isRotating, rotation])

  useAnimatedReaction(
    () => (offset?.value ?? 0) < -100,
    (value, previous) => {
      if (value && !previous) {
        runOnJS(feedback)()
      }

      if (!value && previous && !isRotating.value) {
        spin()

        if (onPull) {
          runOnJS(onPull)()
        }
      }
    },
    [offset]
  )

  useAnimatedReaction(
    () => [isRotating.value, isWaitingSV.value],
    ([isRotating, isWaiting]) => {
      if (!isRotating && isWaiting) {
        spin()
      }
    }
  )

  useEffect(() => {
    isWaitingSV.value = isWaiting ?? false
    if (isWaiting && !isRotating.value) {
      spin()
    }
  }, [isRotating, isWaiting, isWaitingSV, spin])

  const animatedStyle = useAnimatedStyle(() => {
    const normalizedOffset = Math.abs(Math.min(offset?.value ?? 0, 0))
    const size = Math.pow(normalizedOffset, 0.85)

    return {
      transform: [
        { scale: 0.5 + size / 96 + 0.125 - Math.sin(Math.abs(rotation.value - 180) / 1440) },
        { translateY: size / 1.25 },
        { rotate: `${rotation.value + Math.sqrt(normalizedOffset)}deg` },
      ],
      width: 96,
      height: 96,
      left: -48 + width / 2,
      bottom: -10,
      opacity: withSpring(SHOW_ROTATION ? 1 : isWaitingSV.value ? 0.3 : 1),
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
        disabled={!showBackButton}
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
          {(showBackButton || displayClass > DisplayClass.Medium) && (
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
              fontWeight: '700',
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
        <Pressable onPress={() => router.navigate('/profile')}>
          <ProfilePicture userId={user?.id} size={32} />
        </Pressable>
      </Animated.View>
    </View>
  )
}
