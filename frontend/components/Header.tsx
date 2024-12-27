import { Icon } from './Icon'
import { ProfilePicture } from './ProfilePicture'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
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

const AnimatedImage = Animated.createAnimatedComponent(Image)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require('@assets/icon.svg')

export default function Header({ offset, isWaiting, onPull, showBackButton }: HeaderProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayClass = useDisplayClass()
  const isRotating = useSharedValue(false)
  const isWaitingSV = useSharedValue(false)
  const rotation = useSharedValue(0)
  const { width } = useWindowDimensions()

  const spin = useCallback(() => {
    'worklet'
    isRotating.value = true
    rotation.value = withSpring(360, { damping: 10, stiffness: 40 }, () => {
      rotation.value = 0
      isRotating.value = false
    })
  }, [isRotating, rotation])

  useAnimatedReaction(
    () => (offset?.value ?? 0) < -100,
    (value, previous) => {
      if (value && !previous) {
        // TODO: feedback here
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
        { rotate: `${rotation.value}deg` },
        { scale: 1 + 0.25 - Math.sin(Math.abs(rotation.value - 180) / 720) },
      ],
      height: 48 + size,
      width: 48 + size,
      bottom: 14 - size * 1.5,
      left: -24 - size / 2 + width / 2,
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
        paddingHorizontal: 12,
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

      <Pressable
        disabled={onPull === undefined}
        onPress={onPull}
        style={({ pressed }) => [StyleSheet.absoluteFill, { opacity: pressed ? 0.5 : 1 }]}
      >
        <AnimatedImage
          source={icon}
          style={[{ position: 'absolute' }, animatedStyle]}
          contentFit='contain'
          tintColor={theme.colors.primary}
        />
      </Pressable>

      <Animated.View style={offsetStyle}>
        <Pressable onPress={() => router.navigate('/profile')}>
          <ProfilePicture userId={user?.id} size={32} />
        </Pressable>
      </Animated.View>
    </View>
  )
}
