import { Icon, IconName } from './Icon'
import { useSnackFABInset } from './SnackBar'
import { Text } from '@components/Text'
import { buttonCornerSpringConfig } from '@styling/animationConfigs'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import React, { useImperativeHandle, useRef, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

const springConfig = {
  damping: 50,
  stiffness: 500,
}

export interface FloatingActionButtonProps {
  icon: IconName
  title?: string
  onPress?: () => void
}

export interface FloatingActionButtonRef {
  expand: () => void
  collapse: () => void
}

export function useFABScrollHandler(fabVisible?: boolean) {
  useSnackFABInset(fabVisible)
  const fab = useRef<FloatingActionButtonRef>(null)
  const previousOffset = useRef(0)

  const handler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const change = previousOffset.current - e.nativeEvent.contentOffset.y
    const bottom = e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height

    if (
      bottom > e.nativeEvent.contentSize.height - 16 ||
      change > 16 ||
      e.nativeEvent.contentOffset.y < 32
    ) {
      fab.current?.expand()
      previousOffset.current = e.nativeEvent.contentOffset.y
    } else if (change < -16) {
      fab.current?.collapse()
      previousOffset.current = e.nativeEvent.contentOffset.y
    }
  }

  return [fab, handler] as const
}

export const FloatingActionButton = React.forwardRef<
  FloatingActionButtonRef,
  FloatingActionButtonProps
>(function FloatingActionButton({ icon, title, onPress }, ref) {
  const [isPressed, setIsPressed] = useState(false)
  const expandedWidth = useSharedValue<number | undefined>(undefined)
  const expanded = useSharedValue(true)
  const theme = useTheme()

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(expanded.value ? (expandedWidth.value as number) : 56, springConfig),
    }
  })

  const textScale = useAnimatedStyle(() => {
    return {
      opacity: withSpring(expanded.value ? 1 : 0, springConfig),
      transform: [
        {
          scale: withSpring(expanded.value ? 1 : 0, springConfig),
        },
      ],
    }
  })

  const outerAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderRadius: withSpring(isPressed ? 30 : 12, buttonCornerSpringConfig),
      transform: [{ scale: withSpring(isPressed ? 1.05 : 1, buttonCornerSpringConfig) }],
    }
  })

  useImperativeHandle(ref, () => ({
    expand: () => {
      expanded.value = true
    },
    collapse: () => {
      expanded.value = false
    },
  }))

  return (
    <Animated.View
      style={[
        outerAnimatedStyle,
        {
          backgroundColor: theme.colors.primaryContainer,
          overflow: 'hidden',
        },
        styles.paneShadow,
      ]}
    >
      <Pressable
        ref={(ref) => {
          if (ref && !expandedWidth.value) {
            expandedWidth.value = measure(ref).width
          }
        }}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={(state) => {
          return {
            opacity: state.pressed ? 0.8 : state.hovered ? 0.9 : 1,
            backgroundColor: state.pressed
              ? `${theme.colors.surface}44`
              : state.hovered
                ? `${theme.colors.surface}22`
                : 'transparent',
          }
        }}
      >
        <Animated.View
          style={[
            {
              height: 56,
              paddingHorizontal: 16,
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
            },
            animatedStyle,
          ]}
        >
          <Icon name={icon} size={24} color={theme.colors.onPrimaryContainer} />
          {title !== undefined && title.length > 0 && (
            <Animated.View style={textScale}>
              <Text
                selectable={false}
                numberOfLines={1}
                style={{ fontSize: 18, fontWeight: '700', color: theme.colors.onPrimaryContainer }}
              >
                {title}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
})
