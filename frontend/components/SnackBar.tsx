import { RoundIconButton } from './RoundIconButton'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useFocusEffect } from 'expo-router'
import React, { createContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TranslatableError } from 'shared'

const SNACK_DURATION = 7000

interface SnackBarContextType {
  show: (message: string, actionText?: string, action?: () => Promise<void>) => void
  setBottomInset: (inset: number) => void
}

interface SnackData {
  message: string
  index: number
  actionText?: string
  action?: () => Promise<void>
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

  return (
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
        style={{ color: theme.colors.inverseOnSurface, fontSize: 18, flex: 1, paddingVertical: 12 }}
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
                  error instanceof TranslatableError
                    ? t(error.message)
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
          justifyContent: 'center',
          opacity: pressed ? 0.5 : 1,
        })}
      />
    </Animated.View>
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
      setSnack(queue.current.shift()!)
      scheduleDismissSnack()
    } else {
      setSnack(null)
    }
  }

  const scheduleDismissSnack = () => {
    if (!timeout.current) {
      timeout.current = setTimeout(() => {
        dismissSnack()
      }, SNACK_DURATION)
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: withSpring(insets.bottom + 8 + bottomInset.value, {
        damping: 20,
        stiffness: 250,
      }),
    }
  })

  return (
    <SnackBarContext.Provider
      value={{
        show: (message: string, actionText?: string, action?: () => Promise<void>) => {
          const newSnack = { message, index: nextIndex.current, actionText, action }
          if (snack) {
            queue.current.push(newSnack)
          } else {
            setSnack(newSnack)
          }

          nextIndex.current += 1
          scheduleDismissSnack()
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

export function useSnackFABInset() {
  const context = React.useContext(SnackBarContext)
  const displayClass = useDisplayClass()

  // TODO: this will break on multiple insets at once
  useFocusEffect(() => {
    if (displayClass > DisplayClass.Medium) {
      return
    }

    context?.setBottomInset(80)
    return () => {
      context?.setBottomInset(0)
    }
  })
}
