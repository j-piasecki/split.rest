import { Icon, IconName } from './Icon'
import { RoundIconButton } from './RoundIconButton'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { Rect, measure } from '@utils/measure'
import { resolveFontName } from '@utils/resolveFontName'
import React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOutUp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface PickerItem {
  label: string
  value: string
  icon?: IconName
}

export interface PickerProps {
  items: PickerItem[]
  selectedItem: string
  onSelectionChange: (item: string) => void
  hint?: string
  style?: StyleProp<ViewStyle>
}

export function Picker({ hint, items, selectedItem, onSelectionChange, style }: PickerProps) {
  const theme = useTheme()
  const isFocused = useSharedValue(false)
  const buttonRotation = useSharedValue(0)
  const wrapperRef = useRef<View>(null)
  const [isOpened, setIsOpened] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [wrapperLayout, setWrapperLayout] = useState<Rect>({ width: 0, height: 0, x: 0, y: 0 })

  const selected = items.find((item) => item.value === selectedItem) ?? items[0]

  useAnimatedReaction(
    () => isFocused.value,
    (value, previous) => {
      if (value !== previous) {
        buttonRotation.value = withTiming(value ? 180 : 0, { duration: 200 })
      }
    }
  )

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: -4,
      color: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  const wrapperStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${buttonRotation.value}deg` }],
    }
  })

  function open() {
    if (wrapperRef.current) {
      setWrapperLayout(measure(wrapperRef.current))
      setIsOpened(true)
      isFocused.value = true
    }
  }

  function close() {
    if (Platform.OS === 'web') {
      setIsOpened(false)
      setShowContent(true)
      isFocused.value = false
      return
    }

    setShowContent(false)
    isFocused.value = false
    setTimeout(() => {
      setIsOpened(false)
      setShowContent(true)
    }, 200)
  }

  return (
    <View style={style}>
      {hint && (
        <Animated.Text
          style={[
            {
              position: 'absolute',
              fontFamily: resolveFontName(),
              fontSize: Platform.OS === 'ios' ? 10 : 10,
            },
            animatedStyle,
          ]}
        >
          {hint}
        </Animated.Text>
      )}
      <Pressable ref={wrapperRef} onPress={open}>
        <Animated.View
          style={[
            wrapperStyle,
            {
              borderBottomWidth: 1,
              borderRadius: 2,
              paddingTop: 12,
              paddingBottom: 8,
              paddingLeft: 8,
              paddingRight: 36,
              flexDirection: 'row',
            },
          ]}
        >
          <Text
            style={{ flex: 1, fontSize: 14, fontWeight: 600, color: theme.colors.onSurface }}
            numberOfLines={1}
          >
            {selected.label}
          </Text>
          <Animated.View style={[buttonStyle, { position: 'absolute', right: -4, bottom: 0 }]}>
            <RoundIconButton
              icon={'arrowDown'}
              onPress={open}
              color={isOpened ? theme.colors.primary : undefined}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>

      <Modal visible={isOpened} transparent statusBarTranslucent navigationBarTranslucent>
        {showContent && (
          <Animated.View style={StyleSheet.absoluteFill} entering={FadeIn.duration(200)}>
            <Pressable onPress={close} style={StyleSheet.absoluteFill} />
            <PickerContent
              items={items}
              selectedItem={selectedItem}
              onSelectionChange={(item) => {
                onSelectionChange(item)
                close()
              }}
              wrapperLayout={wrapperLayout}
            />
          </Animated.View>
        )}
      </Modal>
    </View>
  )
}

interface PickerContentProps {
  items: PickerItem[]
  selectedItem: string
  onSelectionChange: (item: string) => void
  wrapperLayout: Rect
}

function PickerContent({
  items,
  selectedItem,
  onSelectionChange,
  wrapperLayout,
}: PickerContentProps) {
  const theme = useTheme()
  const containerRef = useRef<View>(null)
  const insets = useSafeAreaInsets()
  const [containerPosition, setContainerPosition] = useState(wrapperLayout.y + wrapperLayout.height)
  const [containerBelow, setContainerBelow] = useState(true)
  const { height } = useWindowDimensions()

  useLayoutEffect(() => {
    if (containerRef.current) {
      const containerLayout = measure(containerRef.current)
      const wrapperY = wrapperLayout.y + (Platform.OS === 'android' ? insets.top : 0)

      if (containerLayout.y + containerLayout.height > height - insets.bottom) {
        setContainerPosition(wrapperY - containerLayout.height - 4)
        setContainerBelow(false)
      } else {
        setContainerPosition(wrapperY + wrapperLayout.height)
        setContainerBelow(true)
      }
    }
  }, [height, insets.bottom, insets.top, wrapperLayout])

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={Platform.OS !== 'web' ? FadeOutUp.duration(200) : undefined}
      ref={containerRef}
      style={[
        {
          position: 'absolute',
          top: containerPosition,
          left: wrapperLayout.x,
          width: wrapperLayout.width,
          backgroundColor: theme.colors.surfaceContainer,
          maxHeight: 250,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          transformOrigin: containerBelow ? 'top' : 'bottom',
          overflow: 'hidden',
        },
        containerBelow
          ? { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }
          : { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
      ]}
    >
      <ScrollView style={{ flex: 1 }}>
        {items.map((item, index) => (
          <React.Fragment key={item.value}>
            <Pressable
              onPress={() => onSelectionChange(item.value)}
              style={({ pressed, hovered }) => ({
                padding: 16,
                backgroundColor: pressed
                  ? theme.colors.surfaceContainerHighest
                  : hovered || selectedItem === item.value
                    ? theme.colors.surfaceContainerHigh
                    : 'transparent',
                userSelect: 'none',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              })}
            >
              {item.icon && (
                <Icon
                  name={item.icon}
                  size={20}
                  color={
                    item.value === selectedItem ? theme.colors.primary : theme.colors.secondary
                  }
                />
              )}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color:
                    item.value === selectedItem ? theme.colors.primary : theme.colors.onSurface,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
            {index !== items.length - 1 && (
              <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant }} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </Animated.View>
  )
}
