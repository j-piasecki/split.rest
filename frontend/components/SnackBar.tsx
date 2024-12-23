import { RoundIconButton } from './RoundIconButton'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import React, { createContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TranslatableError } from 'shared'

const SNACK_DURATION = 7000

interface SnackBarContextType {
  show: (message: string, actionText?: string, action?: () => Promise<void>) => void
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
        maxWidth: 800,
        minWidth: 350,
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 4,
        gap: 8,
      }}
    >
      <Text
        style={{ color: theme.colors.inverseOnSurface, fontSize: 18, flex: 1 }}
        numberOfLines={numberOfLines}
      >
        {data.message}
      </Text>

      {data.action && data.actionText && (
        <Pressable
          disabled={actionRunning}
          style={{
            height: '100%',
            paddingHorizontal: 8,
            justifyContent: 'center',
            opacity: actionRunning ? 0.5 : 1,
          }}
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
        style={{ backgroundColor: 'transparent', padding: 0 }}
      />
    </Animated.View>
  )
}

export function SnackBarProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  const [snack, setSnack] = useState<SnackData | null>(null)

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
      }}
    >
      <>{children}</>

      {/* TODO: FAB padding */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 8,
          justifyContent: 'center',
          flexDirection: 'row',
        }}
        pointerEvents='box-none'
      >
        {snack && (
          <Snack
            data={snack}
            dismiss={dismissSnack}
            clearScheduledDismiss={clearScheduledDismiss}
          />
        )}
      </View>
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
