import { RoundIconButton } from './RoundIconButton'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useFocusEffect } from 'expo-router'
import React, { createContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { isTranslatableError } from 'shared'

const SNACK_DURATION_SHORT = 3000
const SNACK_DURATION_MEDIUM = 5000
const SNACK_DURATION_LONG = 10000

const DURATION = {
  SHORT: SNACK_DURATION_SHORT,
  MEDIUM: SNACK_DURATION_MEDIUM,
  LONG: SNACK_DURATION_LONG,
} as const

interface SnackOptions {
  message: string
  actionText?: string
  action?: () => Promise<void>
  duration?: number
}

interface SnackBarContextType {
  duration: typeof DURATION
  show: (options: SnackOptions) => void
  setBottomInset: (inset: number) => void
}

interface SnackData {
  message: string
  index: number
  actionText?: string
  action?: () => Promise<void>
  duration: number
}

const SnackBarContext = createContext<SnackBarContextType | undefined>(undefined)

function Snack({
  data,
  dismiss,
  clearScheduledDismiss,
}: {
  data: SnackData
  dismiss: () => void
  clearScheduledDismiss: () => void
}) {
  const theme = useTheme()
  const displayClass = useDisplayClass()
  const { t } = useTranslation()
  const [actionRunning, setActionRunning] = useState(false)

  const numberOfLines = displayClass <= DisplayClass.Expanded ? 2 : 1

  const dismissGesture = Gesture.Fling().runOnJS(true).onStart(dismiss).direction(Directions.DOWN)

  return (
    <GestureDetector gesture={dismissGesture}>
      <Animated.View
        entering={SlideInDown.duration(500)}
        exiting={SlideOutDown.duration(500)}
        key={data.index}
        style={{
          flex: displayClass <= DisplayClass.Expanded ? 1 : undefined,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.colors.inverseSurface,
          maxWidth: 768,
          minWidth: 350,
          paddingLeft: 16,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.inverseOnSurface,
            fontSize: 18,
            flex: 1,
            paddingVertical: 12,
          }}
          numberOfLines={numberOfLines}
        >
          {data.message}
        </Text>

        {data.action && data.actionText && (
          <Pressable
            disabled={actionRunning}
            style={({ pressed }) => ({
              height: '100%',
              paddingHorizontal: 8,
              justifyContent: 'center',
              opacity: pressed || actionRunning ? 0.5 : 1,
            })}
            onPress={() => {
              clearScheduledDismiss()
              setActionRunning(true)

              data.action!()
                .then(() => {
                  setActionRunning(false)
                  dismiss()
                })
                .catch((error) => {
                  setActionRunning(false)
                  // TODO: handle this gracefully
                  // don't dismiss in case of an error, retrying might be necessary
                  alert(
                    isTranslatableError(error)
                      ? t(error.message, error.args)
                      : error instanceof Error
                        ? error.message
                        : error
                  )
                })
            }}
          >
            <Text
              style={{ color: theme.colors.inversePrimary, fontSize: 18, fontWeight: 600 }}
              numberOfLines={numberOfLines}
            >
              {data.actionText}
            </Text>
          </Pressable>
        )}

        <RoundIconButton
          icon='close'
          onPress={dismiss}
          color={theme.colors.inverseOnSurface}
          style={({ pressed }) => ({
            backgroundColor: 'transparent',
            borderRadius: 0,
            height: '100%',
            paddingVertical: 0,
            paddingRight: 16,
            paddingLeft: 4,
            marginLeft: 8,
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        />
      </Animated.View>
    </GestureDetector>
  )
}

export function SnackBarProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  const [snack, setSnack] = useState<SnackData | null>(null)
  const bottomInset = useSharedValue(0)

  const queue = useRef<SnackData[]>([])
  const nextIndex = useRef(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearScheduledDismiss = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }
  }

  const dismissSnack = () => {
    clearScheduledDismiss()

    if (queue.current.length > 0) {
      const snack = queue.current.shift()!
      setSnack(snack)
      scheduleDismissSnack(snack)
    } else {
      setSnack(null)
    }
  }

  const scheduleDismissSnack = (snack: SnackData) => {
    if (!timeout.current) {
      timeout.current = setTimeout(() => {
        dismissSnack()
      }, snack.duration)
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(-(insets.bottom + 8 + bottomInset.value), {
            damping: 20,
            stiffness: 250,
          }),
        },
      ],
    }
  })

  return (
    <SnackBarContext.Provider
      value={{
        duration: DURATION,
        show: ({ message, actionText, action, duration }: SnackOptions) => {
          const newSnack = {
            message,
            index: nextIndex.current,
            actionText,
            action,
            duration: duration ?? (action ? SNACK_DURATION_LONG : SNACK_DURATION_MEDIUM),
          }
          if (snack) {
            queue.current.push(newSnack)
          } else {
            setSnack(newSnack)
          }

          nextIndex.current += 1
          scheduleDismissSnack(newSnack)
        },
        setBottomInset: (inset: number) => {
          bottomInset.value = inset
        },
      }}
    >
      <>{children}</>

      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 24,
            justifyContent: 'center',
            flexDirection: 'row',
          },
          animatedStyle,
        ]}
        pointerEvents='box-none'
      >
        {snack && (
          <Snack
            data={snack}
            dismiss={dismissSnack}
            clearScheduledDismiss={clearScheduledDismiss}
          />
        )}
      </Animated.View>
    </SnackBarContext.Provider>
  )
}

export function useSnack() {
  const context = React.useContext(SnackBarContext)
  if (!context) {
    throw new Error('useSnackBar must be used within a SnackBarProvider')
  }
  return context
}

export function useSnackFABInset(fabVisible?: boolean) {
  const context = React.useContext(SnackBarContext)
  const displayClass = useDisplayClass()

  useEffect(() => {
    if (displayClass > DisplayClass.Medium || fabVisible === false) {
      return
    }

    context?.setBottomInset(84)
    return () => {
      context?.setBottomInset(0)
    }
  }, [context, displayClass, fabVisible])

  // TODO: this will break on multiple insets at once
  useFocusEffect(() => {
    if (displayClass > DisplayClass.Medium || fabVisible === false) {
      return
    }

    context?.setBottomInset(84)
    return () => {
      context?.setBottomInset(0)
    }
  })
}
