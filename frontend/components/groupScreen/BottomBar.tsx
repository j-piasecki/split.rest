import { FloatingActionButtonRef } from '@components/FloatingActionButton'
import { Icon } from '@components/Icon'
import { buttonCornerSpringConfig, buttonPaddingSpringConfig } from '@styling/animationConfigs'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useRouter } from 'expo-router'
import { useEffect, useImperativeHandle, useState } from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { GroupUserInfo } from 'shared'

export interface BottomBarProps {
  info: GroupUserInfo | undefined
  ref: React.RefObject<FloatingActionButtonRef | null>
  disableSplit?: boolean
}

export function BottomBar({ info, ref, disableSplit }: BottomBarProps) {
  const theme = useTheme()
  const router = useRouter()
  const isExpanded = useSharedValue(Platform.OS === 'web')
  const [splitPressed, setSplitPressed] = useState(false)

  const splitEnabled = info?.permissions?.canCreateSplits?.() && !disableSplit

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        isExpanded.value = true
      }, 200)
    }
  }, [isExpanded])

  useImperativeHandle(ref, () => ({
    expand: () => {
      isExpanded.value = true
    },
    collapse: () => {
      isExpanded.value = false
    },
  }))

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(isExpanded.value || Platform.OS === 'web' ? 0 : 16, {
            duration: 200,
          }),
        },
      ],
    }
  })

  const splitAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isExpanded.value ? 80 : 56, buttonPaddingSpringConfig),
      height: withSpring(isExpanded.value ? 80 : 56, buttonPaddingSpringConfig),
      borderRadius: withSpring(splitPressed ? 28 : 20, buttonCornerSpringConfig),
      transform: [{ scale: withSpring(splitPressed ? 1.1 : 1, buttonPaddingSpringConfig) }],
    }
  })

  const splitBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(splitPressed ? `${theme.colors.primary}33` : 'transparent', {
        duration: 200,
      }),
    }
  })

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isExpanded.value ? 1 : 0.85, buttonPaddingSpringConfig) }],
    }
  })

  if (!splitEnabled) {
    return null
  }

  return (
    <Animated.View
      style={[
        {
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexDirection: 'row',
        },
        containerAnimatedStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: theme.colors.primaryContainer,
            zIndex: 1000,
            overflow: 'hidden',
          },
          styles.bottomBarShadow,
          splitAnimatedStyle,
        ]}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, splitBackgroundAnimatedStyle]}>
          <Pressable
            disabled={!splitEnabled}
            onPress={() => {
              SplitCreationContext.create().begin()
              router.navigate(`/group/${info?.id}/addSplit`)
            }}
            onPressIn={() => setSplitPressed(true)}
            onPressOut={() => setSplitPressed(false)}
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: splitEnabled ? 1 : 0.4,
            }}
          >
            <Animated.View style={iconAnimatedStyle}>
              <Icon name='split' color={theme.colors.onPrimaryContainer} size={28} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}
