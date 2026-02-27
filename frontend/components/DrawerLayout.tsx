import { drawerSpringConfig } from '@styling/animationConfigs'
import { useTheme } from '@styling/theme'
import { HapticFeedback } from '@utils/hapticFeedback'
import { usePathname, useSegments } from 'expo-router'
import React, { createContext, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { Keyboard, StyleSheet, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector, GestureType } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export const DrawerLayoutContext = createContext<
  | {
      panGesture: React.RefObject<GestureType | undefined>
      closeDrawer: (ignoreLock?: boolean) => void
      openDrawer: () => void
    }
  | undefined
>(undefined)

interface OverlayProps {
  progress: SharedValue<number>
  closeDrawer: (ignoreLock?: boolean) => void
}

function Overlay(props: OverlayProps) {
  const tap = Gesture.Tap().onStart(() => {
    props.closeDrawer(false)
  })

  const style = useAnimatedStyle(() => {
    return {
      opacity: props.progress.value * 0.75,
      transform: [{ translateX: props.progress.value === 0 ? 10000 : 0 }],
    }
  })

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]} />
    </GestureDetector>
  )
}

interface DrawerLayoutProps {
  drawerWidth?: number
  children?: React.ReactNode
  enabled?: boolean
  renderDrawerContent?: () => React.ReactNode
  ref?: React.RefObject<DrawerLayoutRef>
}

export interface DrawerLayoutRef {
  openDrawer: () => void
  closeDrawer: (ignoreLock?: boolean) => void
}

function closeKeyboard() {
  Keyboard.dismiss()
}

function hapticFeedback() {
  HapticFeedback.pullDownActive()
}

export function DrawerLayout({
  drawerWidth: propsDrawerWidth,
  children,
  enabled = true,
  renderDrawerContent,
  ref,
}: DrawerLayoutProps) {
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  const drawerWidth = propsDrawerWidth ?? Math.min(screenWidth * 0.85, 400)
  const segments = useSegments() as string[]
  const pathname = usePathname()
  const isOnGroupScreen = segments[0] === 'group' && segments.length === 2
  const isNoGroupSelected = pathname === '/group/none'

  const panRef = useRef<GestureType | undefined>(undefined)
  const progress = useSharedValue(0)
  const isDragging = useSharedValue(false)
  const isOpen = useSharedValue(false)
  const lockOpen = useSharedValue(isNoGroupSelected)
  const translationStart = useSharedValue(0)
  const progressStart = useSharedValue(0)

  const drawerContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: (progress.value - 1) * drawerWidth }],
    }
  })

  const contentContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drawerWidth * progress.value }],
    }
  })

  const closeDrawer = useCallback(
    (ignoreLock: boolean = true) => {
      'worklet'
      if (lockOpen.value && !ignoreLock) {
        return
      }

      progress.value = withSpring(0, drawerSpringConfig)
      isOpen.value = false
    },
    [isOpen, lockOpen, progress]
  )

  const openDrawer = useCallback(() => {
    'worklet'
    progress.value = withSpring(1, drawerSpringConfig)
    isOpen.value = true
    runOnJS(hapticFeedback)()
  }, [isOpen, progress])

  useImperativeHandle(
    ref,
    () => ({
      openDrawer,
      closeDrawer,
    }),
    [openDrawer, closeDrawer]
  )

  const hasAutoOpened = useRef(false)

  useEffect(() => {
    if (isOnGroupScreen && !hasAutoOpened.current) {
      hasAutoOpened.current = true
      progress.value = 1
      isOpen.value = true
    }
  }, [isOnGroupScreen, progress, isOpen])

  useEffect(() => {
    lockOpen.value = isNoGroupSelected
    if (isNoGroupSelected) {
      openDrawer()
    } else {
      closeDrawer(true)
    }
  }, [isNoGroupSelected, lockOpen, openDrawer, closeDrawer])

  const pan = Gesture.Pan()
    .enabled(enabled && isOnGroupScreen)
    // eslint-disable-next-line react-compiler/react-compiler
    .withRef(panRef)
    .minDistance(40)
    .failOffsetY([-15, 15])
    .onBegin((e) => {
      console.log('onBegin', e)
    })
    .onFinalize((e) => {
      console.log('onFinalize', e)
    })
    .onStart((e) => {
      translationStart.value = e.translationX
      progressStart.value = progress.value

      if (progressStart.value !== 0) {
        isDragging.value = true
      }
      runOnJS(closeKeyboard)()
    })
    .onChange((e) => {
      if (!isDragging.value) {
        isDragging.value = true
        translationStart.value = e.translationX
      } else {
        const newProgress = Math.max(
          lockOpen.value ? 1 : 0,
          Math.min(1, (e.translationX - translationStart.value) / drawerWidth + progressStart.value)
        )
        progress.value = newProgress
      }
    })
    .onEnd((e) => {
      if ((e.velocityX > 500 || progress.value > 0.4) && e.velocityX > -500) {
        if (!isOpen.value) {
          runOnJS(hapticFeedback)()
        }

        isOpen.value = true
        progress.value = withSpring(1, drawerSpringConfig)
      } else {
        if (isOpen.value) {
          runOnJS(hapticFeedback)()
        }
        if (!lockOpen.value) {
          isOpen.value = false
          progress.value = withSpring(0, drawerSpringConfig)
        } else {
          progress.value = withSpring(1, drawerSpringConfig)
        }
      }

      isDragging.value = false
    })

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ flex: 1 }}>
        <DrawerLayoutContext.Provider value={{ panGesture: panRef, closeDrawer, openDrawer }}>
          <Animated.View
            style={[
              drawerContainerStyle,
              {
                width: drawerWidth,
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            {renderDrawerContent?.()}
          </Animated.View>
          <Animated.View style={[{ flex: 1, overflow: 'hidden' }, contentContainerStyle]}>
            {children}
            <Overlay progress={progress} closeDrawer={closeDrawer} />
          </Animated.View>
        </DrawerLayoutContext.Provider>
      </Animated.View>
    </GestureDetector>
  )
}
