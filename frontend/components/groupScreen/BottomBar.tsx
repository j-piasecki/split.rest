import { FloatingActionButtonRef } from '@components/FloatingActionButton'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { buttonCornerSpringConfig, buttonPaddingSpringConfig } from '@styling/animationConfigs'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useRouter } from 'expo-router'
import { useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  disableSettleUp?: boolean
  disableSplit?: boolean
}

export function BottomBar({ info, ref, disableSettleUp, disableSplit }: BottomBarProps) {
  const theme = useTheme()
  const router = useRouter()
  const isExpanded = useSharedValue(Platform.OS === 'web')
  const [settleUpPressed, setSettleUpPressed] = useState(false)
  const [splitPressed, setSplitPressed] = useState(false)
  const { t } = useTranslation()

  const settleUpEnabled =
    Number(info?.balance) !== 0 && info?.permissions?.canSettleUp?.() && !disableSettleUp
  const splitEnabled = info?.permissions?.canCreateSplits?.() && !disableSplit

  const isAddSplitSidebar = !settleUpEnabled && splitEnabled
  const hideEverything = !settleUpEnabled && !splitEnabled
  const onlySettleUp = settleUpEnabled && !splitEnabled

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
      if (!onlySettleUp) {
        isExpanded.value = false
      }
    },
  }))

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      pointerEvents: isExpanded.value ? 'auto' : 'none',
      transform: [
        {
          translateY: withTiming(isExpanded.value || Platform.OS === 'web' ? 0 : 16, {
            duration: 200,
          }),
        },
      ],
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isExpanded.value ? 1 : 0, { duration: 200 }) }],
      opacity: withTiming(isExpanded.value ? 1 : 0, { duration: 200 }),
    }
  })

  // If we are showing the "Add split" sidebar, we fully hide it when collapsed (width 0).
  // Otherwise it collapses to 64.
  const sideBarAnimatedStyle = useAnimatedStyle(() => {
    const collapsedWidth = isAddSplitSidebar ? 0 : 64
    return {
      maxWidth: withSpring(isExpanded.value ? 250 : collapsedWidth, buttonPaddingSpringConfig),
      height: withSpring(isExpanded.value ? 56 : 40, buttonPaddingSpringConfig),
      opacity: withTiming(isExpanded.value || !isAddSplitSidebar ? 1 : 0, { duration: 200 }),
    }
  })

  const splitAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isExpanded.value ? 72 : 56, buttonPaddingSpringConfig),
      height: withSpring(isExpanded.value ? 72 : 56, buttonPaddingSpringConfig),
      borderRadius: withSpring(splitPressed ? 28 : 16, buttonCornerSpringConfig),
      transform: [{ scale: withSpring(splitPressed ? 1.15 : 1, buttonPaddingSpringConfig) }],
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
      borderTopRightRadius: withSpring(
        onlySettleUp ? (settleUpPressed ? 28 : 16) : 0,
        buttonCornerSpringConfig
      ),
      borderBottomRightRadius: withSpring(
        onlySettleUp ? (settleUpPressed ? 28 : 16) : 0,
        buttonCornerSpringConfig
      ),
      height: withSpring(settleUpPressed ? 64 : 56, buttonPaddingSpringConfig),
    }
  })

  const settleUpBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(settleUpPressed ? `${theme.colors.primary}44` : 'transparent'),
    }
  })

  if (hideEverything) {
    return null
  }

  const sidebarBgColor = isAddSplitSidebar
    ? theme.colors.primaryContainer
    : theme.colors.secondaryContainer

  const sidebarTextColor = isAddSplitSidebar
    ? theme.colors.onPrimaryContainer
    : theme.colors.onSecondaryContainer

  return (
    <Pressable
      onPress={() => {
        if (!isExpanded.value) {
          isExpanded.value = true
        }
      }}
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        /* @ts-expect-error userSelect does not exist on StyleSheet */
        userSelect: 'none',
        // catch touches on Android
        backgroundColor: '#00000001',
      }}
    >
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
              backgroundColor: sidebarBgColor,
              transform: [{ translateX: onlySettleUp ? 0 : 12 }],
              overflow: 'hidden',
            },
            styles.bottomBarShadow,
            sideBarAnimatedStyle,
            settleUpAnimatedStyle,
          ]}
        >
          <Animated.View style={[{ height: '100%' }, settleUpBackgroundAnimatedStyle]}>
            <Pressable
              disabled={isAddSplitSidebar ? !splitEnabled : !settleUpEnabled}
              onPress={() => {
                if (isAddSplitSidebar) {
                  SplitCreationContext.create().begin()
                  router.navigate(`/group/${info?.id}/addSplit`)
                } else {
                  router.navigate(`/group/${info?.id}/settleUp`)
                }
              }}
              onPressIn={() => setSettleUpPressed(true)}
              onPressOut={() => setSettleUpPressed(false)}
              style={{
                height: '100%',
                paddingLeft: 24,
                paddingRight: isAddSplitSidebar ? 0 : 24,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                gap: 8,
                opacity: (isAddSplitSidebar ? splitEnabled : settleUpEnabled) ? 1 : 0.4,
              }}
            >
              {!isAddSplitSidebar && <Icon name='balance' color={sidebarTextColor} size={20} />}
              {isAddSplitSidebar && (
                <Animated.View style={{ width: 12 }} /> // Maintain some spacing so text isn't directly touching the circle button
              )}
              <Animated.View style={[textAnimatedStyle, { transformOrigin: 'right center' }]}>
                <Text style={[{ fontSize: 16, fontWeight: '700', color: sidebarTextColor }]}>
                  {isAddSplitSidebar ? t('groupInfo.addSplit') : t('groupInfo.settleUp.settleUp')}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {!onlySettleUp && (
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
                <Icon name='split' color={theme.colors.onPrimaryContainer} size={24} />
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  )
}
