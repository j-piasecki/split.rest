import { Icon, IconName } from './Icon'
import { useTheme } from '@styling/theme'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import React, { useEffect, useImperativeHandle, useLayoutEffect } from 'react'
import { useRef, useState } from 'react'
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { Modal, Pressable, Text } from 'react-native'
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type Rect = { x: number; y: number; width: number; height: number }
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
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : 'transparent',
          padding: 16,
          opacity: disabled ? 0.5 : 1,
        }
      }}
    >
      {icon && <Icon name={icon} size={20} color={color} />}
      <Text
        style={{
          fontSize: 18,
          color: color,
        }}
      >
        {label}
      </Text>
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
  const isSmallScreen = useIsSmallScreen()
  const contentRef = useRef<View>(null)
  const [contentX, setContentX] = useState(touchPoint.x)
  const [contentY, setContentY] = useState(touchPoint.y)
  const { width, height } = useWindowDimensions()

  useLayoutEffect(() => {
    let frame!: Rect

    if (Platform.OS === 'web') {
      // @ts-expect-error - getBoundingClientRect will not work on mobile
      frame = contentRef.current?.getBoundingClientRect()
    } else {
      contentRef.current?.measureInWindow((x, y, width, height) => {
        frame = { x, y, width, height }
      })
    }

    if (!isSmallScreen) {
      if (frame.y + frame.height > height) {
        setContentY(touchPoint.y - frame.height)
      }

      if (frame.x + frame.width > width) {
        setContentX(touchPoint.x - frame.width)
      }
    } else {
      if (frame.y + frame.height > height) {
        setContentY(anchorRect.y - frame.height - 8)
      } else {
        setContentY(anchorRect.y + anchorRect.height + 8)
      }

      setContentX(anchorRect.x + (anchorRect.width - frame.width) / 2)
    }
  }, [anchorRect, touchPoint, height, width, isSmallScreen])

  return (
    <Animated.View
      entering={Platform.OS !== 'web' ? ZoomIn.duration(150) : undefined}
      ref={contentRef}
      style={{
        position: 'absolute',
        top: contentY,
        left: contentX,
        width: Math.min(anchorRect.width - 16, 300, width - 32),
        backgroundColor: theme.colors.surfaceContainer,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        paddingVertical: 8,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {items.map((item, index) => (
        <ContextMenuItemComponent
          key={index}
          {...item}
          onPress={() => {
            item.onPress()
            setVisible(false)
          }}
        />
      ))}
    </Animated.View>
  )
}

export interface ContextMenuProps {
  children: React.ReactNode
  items: ContextMenuItem[]
  disabled?: boolean
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
  const isSmallScreen = useIsSmallScreen()
  const [visible, setVisible] = useState(false)
  const anchorRef = useRef<View>(null)
  const touchPoint = useRef<Point>()
  const anchorRect = useRef<Rect>()
  const scale = useSharedValue(1)
  const scaleTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useImperativeHandle(ref, () => ({
    open: (anchor) => {
      if (!props.disabled) {
        measureAnchor({ nativeEvent: { pageX: anchor?.x ?? 0, pageY: anchor?.y ?? 0 } })
        setVisible(true)

        if (isSmallScreen) {
          scale.value = withTiming(1.02, { duration: 300 })
        }
      }
    },
  }))

  function measureAnchor(e: { nativeEvent: PointerEvent } | GestureResponderEvent | AnchorEvent) {
    touchPoint.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }

    if (Platform.OS === 'web') {
      // @ts-expect-error - getBoundingClientRect will not work on mobile
      anchorRect.current = anchorRef.current?.getBoundingClientRect()
    } else {
      anchorRef.current?.measureInWindow((x, y, width, height) => {
        anchorRect.current = { x, y, width, height }
      })
    }
  }

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  useEffect(() => {
    if (!visible) {
      scale.value = withTiming(1, { duration: 200 })
    }
  }, [scale, visible])

  return (
    <>
      <Pressable
        disabled={props.disabled}
        ref={anchorRef}
        delayLongPress={400}
        onPressIn={() => {
          if (isSmallScreen) {
            scaleTimeoutRef.current = setTimeout(() => {
              scale.value = withTiming(1.02, { duration: 500 })
            }, 100)
          }
        }}
        onPressOut={() => {
          if (!visible) {
            scale.value = withTiming(1, { duration: 500 })
            clearTimeout(scaleTimeoutRef.current!)
          }
        }}
        onLongPress={(e) => {
          measureAnchor(e)
          setVisible(true)
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
            scale.value = withTiming(1.02, { duration: 300 })
          }
        }}
      >
        <Animated.View style={[{ flex: 1 }, scaleStyle]}>{props.children}</Animated.View>
      </Pressable>
      <Modal visible={visible} onRequestClose={() => setVisible(false)} transparent>
        <Animated.View
          style={StyleSheet.absoluteFillObject}
          entering={isSmallScreen ? FadeIn.duration(300) : undefined}
        >
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
                  backgroundColor: theme.colors.surface,
                  overflow: 'hidden',
                  pointerEvents: 'none',
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
