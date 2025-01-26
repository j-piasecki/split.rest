/* eslint-disable react-compiler/react-compiler */
import { Icon, IconName } from './Icon'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { HapticFeedback } from '@utils/hapticFeedback'
import { Rect, measure } from '@utils/measure'
import React, { useEffect, useImperativeHandle, useLayoutEffect } from 'react'
import { useRef, useState } from 'react'
import {
  GestureResponderEvent,
  Platform,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'
import { Modal, Pressable } from 'react-native'
import Animated, {
  FadeIn,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Point = { x: number; y: number }

export interface ContextMenuItem {
  label: string
  icon?: IconName
  onPress: () => void
  disabled?: boolean
  destructive?: boolean
}

function ContextMenuItemComponent({
  label,
  onPress,
  disabled,
  destructive,
  icon,
}: ContextMenuItem) {
  const theme = useTheme()
  const [isPressed, setIsPressed] = useState(false)

  const color = destructive
    ? theme.colors.error
    : isPressed
      ? theme.colors.primary
      : theme.colors.onSurface

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={({ pressed, hovered }) => {
        return {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: pressed
            ? theme.colors.surfaceBright
            : hovered
              ? theme.colors.surfaceContainerHighest
              : 'transparent',
          paddingHorizontal: 16,
          paddingVertical: 12,
          opacity: disabled ? 0.5 : 1,
        }
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: color,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={color === theme.colors.onSurface ? theme.colors.secondary : color}
        />
      )}
    </Pressable>
  )
}

interface ContextMenuItemsProps {
  anchorRect: Rect
  touchPoint: Point
  items: ContextMenuItem[]
  setVisible: (visible: boolean) => void
}

function ContextMenuItems({ anchorRect, touchPoint, items, setVisible }: ContextMenuItemsProps) {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const contentRef = useRef<View>(null)
  const insets = useSafeAreaInsets()
  const [contentX, setContentX] = useState(touchPoint.x)
  const [contentY, setContentY] = useState(touchPoint.y)
  const [isBelow, setIsBelow] = useState(true)
  const { width, height } = useWindowDimensions()

  useLayoutEffect(() => {
    const frame = measure(contentRef.current!)

    if (!isSmallScreen) {
      if (frame.y + frame.height > height - insets.bottom) {
        setContentY(touchPoint.y - frame.height)
      }

      if (frame.x + frame.width > width) {
        setContentX(touchPoint.x - frame.width)
      }
    } else {
      if (anchorRect.y + anchorRect.height + frame.height > height - insets.bottom) {
        setContentY(anchorRect.y - frame.height - 8)
        setIsBelow(false)
      } else {
        setContentY(anchorRect.y + anchorRect.height + 8)
        setIsBelow(true)
      }

      setContentX(anchorRect.x + (anchorRect.width - frame.width) / 2)
    }
  }, [anchorRect, touchPoint, height, width, isSmallScreen, insets])

  return (
    <Animated.View
      entering={Platform.OS !== 'web' ? FadeInUp.duration(250) : undefined}
      ref={contentRef}
      style={{
        transformOrigin: isBelow ? 'top' : 'bottom',
        position: 'absolute',
        top: contentY,
        left: contentX,
        width: Math.min(anchorRect.width - 16, 320, width - 32),
        backgroundColor: theme.colors.surfaceContainerHigh,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        paddingVertical: 8,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ContextMenuItemComponent
            {...item}
            onPress={() => {
              item.onPress()
              setVisible(false)
            }}
          />

          {index !== items.length - 1 && (
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.outlineVariant,
                marginHorizontal: 8,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Animated.View>
  )
}

export interface ContextMenuProps {
  children: React.ReactNode
  items: ContextMenuItem[]
  disabled?: boolean
  pressDisabled?: boolean
  onPress?: (state: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
}

export interface ContextMenuRef {
  open: (anchor?: Point) => void
}

type AnchorEvent = { nativeEvent: { pageX: number; pageY: number } }

export const ContextMenu = React.forwardRef(function ContextMenu(
  props: ContextMenuProps,
  ref: React.Ref<ContextMenuRef>
) {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const anchorRef = useRef<View>(null)
  const touchPoint = useRef<Point>()
  const anchorRect = useRef<Rect>()
  const scaleAnimation = useSharedValue(0)
  const scaleTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const insets = useSafeAreaInsets()

  useImperativeHandle(ref, () => ({
    open: (anchor) => {
      if (!props.disabled) {
        measureAnchor({ nativeEvent: { pageX: anchor?.x ?? 0, pageY: anchor?.y ?? 0 } })
        setVisible(true)

        if (isSmallScreen) {
          scaleAnimation.value = withTiming(1, { duration: 300 })
        }
      }
    },
  }))

  function measureAnchor(e: { nativeEvent: PointerEvent } | GestureResponderEvent | AnchorEvent) {
    touchPoint.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }
    anchorRect.current = measure(anchorRef.current!)

    if (Platform.OS === 'android') {
      anchorRect.current.y += insets.top
    }
  }

  const scaleStyle = useAnimatedStyle(() => {
    return {
      borderRadius: interpolate(scaleAnimation.value, [0, 1], [0, 8]),
      transform: [{ scale: interpolate(scaleAnimation.value, [0, 1], [1, 1.02]) }],
    }
  })

  useEffect(() => {
    if (!visible) {
      scaleAnimation.value = withTiming(0, { duration: 200 })
    }
  }, [scaleAnimation, visible])

  return (
    <>
      <Pressable
        disabled={props.disabled && (props.pressDisabled || !props.onPress)}
        ref={anchorRef}
        unstable_pressDelay={50}
        delayLongPress={400}
        onPress={!props.pressDisabled ? props.onPress : undefined}
        onPressIn={() => {
          setPressed(true)
          if (isSmallScreen && !props.disabled) {
            scaleTimeoutRef.current = setTimeout(() => {
              scaleAnimation.value = withTiming(1, { duration: 500 })
            }, 100)
          }
        }}
        onPressOut={() => {
          setPressed(false)
          if (!visible) {
            scaleAnimation.value = withTiming(0, { duration: 500 })
            clearTimeout(scaleTimeoutRef.current!)
          }
        }}
        onHoverIn={() => {
          setHovered(true)
        }}
        onHoverOut={() => {
          setHovered(false)
        }}
        onLongPress={(e) => {
          if (!props.disabled) {
            measureAnchor(e)
            setVisible(true)
            HapticFeedback.impactMedium()
          }
        }}
        // @ts-expect-error - onContextMenu does not exist on Pressable on mobile
        onContextMenu={(e) => {
          e.preventDefault()
          if (props.disabled) {
            return
          }

          measureAnchor(e)
          setVisible(true)

          if (isSmallScreen) {
            scaleAnimation.value = withTiming(1, { duration: 300 })
          }
        }}
      >
        <Animated.View
          style={[
            { flex: 1 },
            typeof props.style === 'function' ? props.style({ hovered, pressed }) : props.style,
            scaleStyle,
          ]}
        >
          {props.children}
        </Animated.View>
      </Pressable>
      <Modal
        visible={visible}
        navigationBarTranslucent
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
        transparent
      >
        <Animated.View
          style={StyleSheet.absoluteFillObject}
          entering={Platform.OS !== 'web' ? FadeIn.duration(200) : undefined}
        >
          <Animated.View style={StyleSheet.absoluteFillObject}>
            <Pressable
              onPress={() => setVisible(false)}
              // @ts-expect-error - onContextMenu does not exist on Pressable on mobile
              onContextMenu={(e) => {
                setVisible(false)
                e.preventDefault()
              }}
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: isSmallScreen ? 'rgba(0, 0, 0, 0.5)' : 'transparent' },
              ]}
            />
          </Animated.View>
          {isSmallScreen && (
            <Animated.View
              style={[
                scaleStyle,
                {
                  position: 'absolute',
                  left: anchorRect.current?.x,
                  top: anchorRect.current?.y,
                  width: anchorRect.current?.width,
                  height: anchorRect.current?.height,
                  backgroundColor: theme.colors.surfaceContainer,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  borderRadius: 8,
                },
              ]}
            >
              {props.children}
            </Animated.View>
          )}
          <ContextMenuItems
            anchorRect={anchorRect.current!}
            touchPoint={touchPoint.current!}
            items={props.items}
            setVisible={setVisible}
          />
        </Animated.View>
      </Modal>
    </>
  )
})
