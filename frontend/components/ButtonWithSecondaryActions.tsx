import { Button } from './Button'
import { Icon, IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { Rect, measure } from '@utils/measure'
import React, { useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface ButtonSecondaryAction {
  label: string
  icon?: IconName
  onPress: () => void | Promise<void>
  destructive?: boolean
  disabled?: boolean
}

export type ButtonWithSecondaryActionsAnimationDirection = 'below' | 'above' | 'automatic'

export interface ButtonWithSecondaryActionsProps {
  /** Primary action label */
  title: string
  /** Primary action icon */
  leftIcon?: IconName
  /** Primary action handler */
  onPress: () => void
  /** Primary action loading state */
  isLoading?: boolean
  /** Primary action disabled state */
  disabled?: boolean
  /** Primary action destructive styling */
  destructive?: boolean
  /** Secondary actions */
  secondaryActions?: ButtonSecondaryAction[]
  /** Animation direction for dropdown menu */
  animationDirection?: ButtonWithSecondaryActionsAnimationDirection
  /** Container style */
  style?: StyleProp<ViewStyle>
}

interface ActionMenuProps {
  actions: ButtonSecondaryAction[]
  visible: boolean
  onClose: () => void
  wrapperLayout: Rect
  animationDirection: ButtonWithSecondaryActionsAnimationDirection
  onLoadingChange: (loading: boolean) => void
}

function ActionMenu({
  actions,
  visible,
  onClose,
  wrapperLayout,
  animationDirection,
  onLoadingChange,
}: ActionMenuProps) {
  const theme = useTheme()
  const containerRef = useRef<View>(null)
  const insets = useSafeAreaInsets()
  const [containerPosition, setContainerPosition] = useState(0)
  const [containerBelow, setContainerBelow] = useState(animationDirection !== 'above')
  const [isMeasured, setIsMeasured] = useState(false)
  const [loadingActionIndex, setLoadingActionIndex] = useState<number | null>(null)
  const { height } = useWindowDimensions()

  // First render: measure the container off-screen
  useLayoutEffect(() => {
    if (visible && !isMeasured && containerRef.current) {
      const containerLayout = measure(containerRef.current)
      const wrapperY = wrapperLayout.y + (Platform.OS === 'android' ? insets.top : 0)

      // Use actual measured height
      const actualMenuHeight = containerLayout.height

      // Determine positioning based on animation direction
      if (animationDirection === 'above') {
        setContainerPosition(wrapperY - actualMenuHeight - 8)
        setContainerBelow(false)
      } else if (animationDirection === 'below') {
        setContainerPosition(wrapperY + wrapperLayout.height + 8)
        setContainerBelow(true)
      } else {
        // 'automatic' - position based on available space
        if (wrapperY + wrapperLayout.height + actualMenuHeight > height - insets.bottom - 20) {
          setContainerPosition(wrapperY - actualMenuHeight - 8)
          setContainerBelow(false)
        } else {
          setContainerPosition(wrapperY + wrapperLayout.height + 8)
          setContainerBelow(true)
        }
      }

      setIsMeasured(true)
    }
  }, [
    actions.length,
    animationDirection,
    height,
    insets.bottom,
    insets.top,
    isMeasured,
    visible,
    wrapperLayout,
  ])

  // Reset states when visibility changes
  useLayoutEffect(() => {
    if (!visible) {
      setIsMeasured(false)
      setLoadingActionIndex(null)
      onLoadingChange(false)
    }
  }, [visible, onLoadingChange])

  const handleActionPress = async (action: ButtonSecondaryAction, index: number) => {
    try {
      setLoadingActionIndex(index)
      onLoadingChange(true)
      const result = action.onPress()

      // If it's a promise, wait for it to resolve
      if (result instanceof Promise) {
        await result
      }

      onClose()
    } catch (error) {
      // Let the error bubble up to the action handler
      console.error('Action failed:', error)
    } finally {
      setLoadingActionIndex(null)
      onLoadingChange(false)
    }
  }

  if (!visible) {
    return null
  }

  return (
    <Modal transparent statusBarTranslucent navigationBarTranslucent visible={visible}>
      <Animated.View
        style={StyleSheet.absoluteFill}
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
      >
        <Pressable
          onPress={() => {
            // Don't close if any action is loading
            if (loadingActionIndex === null) {
              onClose()
            }
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        />
      </Animated.View>

      <Animated.View
        ref={containerRef}
        entering={containerBelow ? FadeInUp.duration(200) : FadeInDown.duration(200)}
        exiting={containerBelow ? FadeOutUp.duration(150) : FadeOutDown.duration(150)}
        style={[
          {
            position: 'absolute',
            top: containerPosition,
            left: wrapperLayout.x,
            width: wrapperLayout.width,
            backgroundColor: theme.colors.surfaceContainer,
            maxHeight: 300,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        {actions.map((action, index) => {
          const isLoading = loadingActionIndex === index
          const isDisabled = action.disabled || loadingActionIndex !== null

          return (
            <React.Fragment key={index}>
              <Pressable
                onPress={() => handleActionPress(action, index)}
                disabled={isDisabled}
                style={({ pressed, hovered }) => ({
                  padding: 16,
                  backgroundColor: pressed
                    ? theme.colors.surfaceContainerHighest
                    : hovered
                      ? theme.colors.surfaceContainerHigh
                      : 'transparent',
                  userSelect: 'none',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  opacity: isDisabled ? 0.5 : 1,
                })}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size={22}
                    color={action.destructive ? theme.colors.error : theme.colors.secondary}
                  />
                ) : (
                  action.icon && (
                    <Icon
                      name={action.icon}
                      size={22}
                      color={
                        action.destructive
                          ? theme.colors.error
                          : action.disabled
                            ? theme.colors.outline
                            : theme.colors.secondary
                      }
                    />
                  )
                )}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: action.destructive
                      ? theme.colors.error
                      : isDisabled
                        ? theme.colors.outline
                        : theme.colors.secondary,
                    flex: 1,
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
              {index !== actions.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.outlineVariant,
                    marginHorizontal: 16,
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </Animated.View>
    </Modal>
  )
}

export function ButtonWithSecondaryActions({
  title,
  leftIcon,
  onPress,
  isLoading = false,
  disabled = false,
  destructive = false,
  secondaryActions = [],
  animationDirection = 'automatic',
  style,
}: ButtonWithSecondaryActionsProps) {
  const theme = useTheme()
  const wrapperRef = useRef<View>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [wrapperLayout, setWrapperLayout] = useState<Rect>({ width: 0, height: 0, x: 0, y: 0 })
  const [isActionLoading, setIsActionLoading] = useState(false)

  const hasSecondaryActions = secondaryActions.length > 0

  function openMenu() {
    if (wrapperRef.current && hasSecondaryActions && !isActionLoading) {
      setWrapperLayout(measure(wrapperRef.current))
      setIsMenuOpen(true)
    }
  }

  function closeMenu() {
    if (!isActionLoading) {
      setIsMenuOpen(false)
    }
  }

  return (
    <View style={style}>
      <View
        ref={wrapperRef}
        style={{
          flexDirection: 'row',
          gap: 4,
          alignItems: 'center',
        }}
      >
        <Button
          style={{ flex: 1 }}
          title={title}
          leftIcon={leftIcon}
          onPress={onPress}
          isLoading={isLoading}
          disabled={disabled || isActionLoading}
          destructive={destructive}
        />

        {hasSecondaryActions && (
          <Button
            leftIcon='moreVertical'
            onPress={openMenu}
            disabled={isActionLoading}
            pressableStyle={{ paddingHorizontal: 4 }}
            style={{
              backgroundColor: isMenuOpen ? theme.colors.primary : theme.colors.primaryContainer,
            }}
          />
        )}
      </View>

      <ActionMenu
        actions={secondaryActions}
        visible={isMenuOpen}
        onClose={closeMenu}
        wrapperLayout={wrapperLayout}
        animationDirection={animationDirection}
        onLoadingChange={setIsActionLoading}
      />
    </View>
  )
}
