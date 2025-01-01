import { Icon, IconName } from './Icon'
import { useSnackFABInset } from './SnackBar'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import React, { useImperativeHandle, useRef } from 'react'
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

export function useFABScrollHandler() {
  useSnackFABInset()
  const fab = useRef<FloatingActionButtonRef>(null)
  const previousOffset = useRef(0)

  const handler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const change = previousOffset.current - e.nativeEvent.contentOffset.y
    const bottom = e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height

    if (
      bottom > e.nativeEvent.contentSize.height - 16 ||
      change > 0 ||
      e.nativeEvent.contentOffset.y < 32
    ) {
      fab.current?.expand()
    } else if (change < 0) {
      fab.current?.collapse()
    }

    previousOffset.current = e.nativeEvent.contentOffset.y
  }

  return [fab, handler] as const
}

export const FloatingActionButton = React.forwardRef<
  FloatingActionButtonRef,
  FloatingActionButtonProps
>(function FloatingActionButton({ icon, title, onPress }, ref) {
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

  useImperativeHandle(ref, () => ({
    expand: () => {
      expanded.value = true
    },
    collapse: () => {
      expanded.value = false
    },
  }))

  return (
    <Pressable
      ref={(ref) => {
        if (ref && !expandedWidth.value) {
          expandedWidth.value = measure(ref).width
        }
      }}
      onPress={onPress}
      style={(state) => {
        return [
          {
            borderRadius: 16,
            backgroundColor: theme.colors.primaryContainer,
            opacity: state.pressed ? 0.7 : 1,
            overflow: 'hidden',
          },
        ]
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
  )
})
