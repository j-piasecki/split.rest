import { FloatingActionButtonRef } from '@components/FloatingActionButton'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { buttonCornerSpringConfig, buttonPaddingSpringConfig } from '@styling/animationConfigs'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useRouter } from 'expo-router'
import { useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet } from 'react-native'
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
}

export function BottomBar({ info, ref }: BottomBarProps) {
  const theme = useTheme()
  const router = useRouter()
  const isExpanded = useSharedValue(true)
  const [settleUpPressed, setSettleUpPressed] = useState(false)
  const [roulettePressed, setRoulettePressed] = useState(false)
  const [splitPressed, setSplitPressed] = useState(false)
  const { t } = useTranslation()

  const settleUpEnabled = Number(info?.balance) !== 0

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
      pointerEvents: isExpanded.value ? 'auto' : 'none',
      transform: [{ translateY: withTiming(isExpanded.value ? 0 : 8, { duration: 200 }) }],
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isExpanded.value ? 1 : 0, { duration: 200 }) }],
      opacity: withTiming(isExpanded.value ? 1 : 0, { duration: 200 }),
    }
  })

  const sideBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isExpanded.value ? 144 : 64, buttonPaddingSpringConfig),
      height: withSpring(isExpanded.value ? 56 : 40, buttonPaddingSpringConfig),
    }
  })

  const splitAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isExpanded.value ? 72 : 56, buttonPaddingSpringConfig),
      height: withSpring(isExpanded.value ? 72 : 56, buttonPaddingSpringConfig),
      borderRadius: withSpring(splitPressed ? 34 : 16, buttonCornerSpringConfig),
    }
  })

  const splitBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(splitPressed ? `${theme.colors.primary}33` : 'transparent', {
        duration: 200,
      }),
    }
  })

  const settleUpAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderTopLeftRadius: withSpring(settleUpPressed ? 28 : 16, buttonCornerSpringConfig),
      borderBottomLeftRadius: withSpring(settleUpPressed ? 28 : 16, buttonCornerSpringConfig),
      height: withSpring(settleUpPressed ? 64 : 56, buttonPaddingSpringConfig),
    }
  })

  const settleUpBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(settleUpPressed ? `${theme.colors.primary}44` : 'transparent'),
    }
  })

  const rouletteAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderTopRightRadius: withSpring(roulettePressed ? 28 : 16, buttonCornerSpringConfig),
      borderBottomRightRadius: withSpring(roulettePressed ? 28 : 16, buttonCornerSpringConfig),
      height: withSpring(roulettePressed ? 64 : 56, buttonPaddingSpringConfig),
    }
  })

  const rouletteBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(roulettePressed ? `${theme.colors.primary}33` : 'transparent'),
    }
  })

  return (
    <Pressable
      onPress={() => {
        if (!isExpanded.value) {
          isExpanded.value = true
        }
      }}
      style={{
        width: '100%',
        // @ts-expect-error userSelect does not exist on StyleSheet
        userSelect: 'none',
        // catch touches on Android
        backgroundColor: '#00000001',
      }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          },
          containerAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.secondaryContainer,
              transform: [{ translateX: 12 }],
              overflow: 'hidden',
            },
            styles.bottomBarShadow,
            sideBarAnimatedStyle,
            settleUpAnimatedStyle,
          ]}
        >
          <Animated.View style={[StyleSheet.absoluteFillObject, settleUpBackgroundAnimatedStyle]}>
            <Pressable
              disabled={!settleUpEnabled}
              onPress={() => {
                router.navigate(`/group/${info?.id}/settleUp`)
              }}
              onPressIn={() => setSettleUpPressed(true)}
              onPressOut={() => setSettleUpPressed(false)}
              style={{
                ...StyleSheet.absoluteFillObject,
                paddingRight: 24,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                gap: 8,
                opacity: settleUpEnabled ? 1 : 0.4,
              }}
            >
              <Icon name='balance' color={theme.colors.onSecondaryContainer} size={20} />
              <Animated.View style={[textAnimatedStyle, { transformOrigin: 'right center' }]}>
                <Text
                  style={[
                    { fontSize: 16, fontWeight: '700', color: theme.colors.onSecondaryContainer },
                  ]}
                >
                  {t('groupInfo.settleUp.settleUp')}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>

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
              onPress={() => {
                router.navigate(`/group/${info?.id}/addSplit`)
              }}
              onPressIn={() => setSplitPressed(true)}
              onPressOut={() => setSplitPressed(false)}
              style={{
                ...StyleSheet.absoluteFillObject,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name='split' color={theme.colors.onPrimaryContainer} size={24} />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.secondaryContainer,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              transform: [{ translateX: -12 }],
              overflow: 'hidden',
            },
            styles.bottomBarShadow,
            sideBarAnimatedStyle,
            rouletteAnimatedStyle,
          ]}
        >
          <Animated.View style={[StyleSheet.absoluteFillObject, rouletteBackgroundAnimatedStyle]}>
            <Pressable
              onPress={() => {
                router.navigate(`/group/${info?.id}/roulette`)
              }}
              onPressIn={() => setRoulettePressed(true)}
              onPressOut={() => setRoulettePressed(false)}
              style={{
                ...StyleSheet.absoluteFillObject,
                paddingLeft: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name='payments' color={theme.colors.onSecondaryContainer} size={20} />
              <Animated.View style={[textAnimatedStyle, { transformOrigin: 'left center' }]}>
                <Text
                  style={[
                    { fontSize: 16, fontWeight: '700', color: theme.colors.onSecondaryContainer },
                  ]}
                >
                  {t('groupInfo.roulette')}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}
