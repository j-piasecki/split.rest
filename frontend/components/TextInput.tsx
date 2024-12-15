import { useTheme } from '@styling/theme'
import { resolveFontName } from '@utils/resolveFontName'
import React, { useMemo } from 'react'
import {
  Platform,
  StyleSheet,
  TextInputProps,
  TextInput as TextInputRN,
  TextStyle,
  ViewStyle,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export interface Props extends TextInputProps {
  error?: boolean
  resetError?: () => void
}

export const TextInput = React.forwardRef<TextInputRN, Props>(function TextInput(
  { style, placeholder, value, onChangeText, error, resetError, onFocus, onBlur, ...rest }: Props,
  ref
) {
  const theme = useTheme()
  const isFocused = useSharedValue(false)

  const fontStyle = useMemo(() => {
    const styles: TextStyle | undefined = StyleSheet.flatten(style)

    if (styles?.fontFamily === undefined) {
      const result: TextStyle = {
        fontFamily: resolveFontName(styles),
      }

      if (Platform.OS === 'android') {
        return result
      }

      if (styles?.fontWeight) {
        result.fontWeight = styles.fontWeight
      }

      if (styles?.fontStyle) {
        result.fontStyle = styles.fontStyle
      }

      return result
    }

    return {}
  }, [style])

  const wrapperStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor: withTiming(
        error
          ? theme.colors.errorContainer
          : isFocused.value
            ? theme.colors.primary
            : theme.colors.outline,
        {
          duration: 200,
        }
      ),
    }
  })

  const hintStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(value ? -2 : 8, { duration: 200 }),
      top: withTiming(value ? -2 : 16, { duration: 200 }),
      transform: [{ scale: withTiming(value ? 0.7 : 1, { duration: 200 }) }],
      color: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  return (
    <Animated.View
      style={[style as ViewStyle, { borderBottomWidth: 1, borderRadius: 4 }, wrapperStyle]}
    >
      <TextInputRN
        ref={ref}
        cursorColor={theme.colors.primary}
        selectionColor={theme.colors.primary}
        style={[
          {
            paddingHorizontal: 8,
            paddingBottom: 8,
            paddingTop: 16,
            color: theme.colors.onSurface,
            fontWeight: '600',
          },
          fontStyle,
        ]}
        value={value}
        onChangeText={(value) => {
          resetError?.()
          onChangeText?.(value)
        }}
        onFocus={(e) => {
          isFocused.value = true
          onFocus?.(e)
        }}
        onBlur={(e) => {
          isFocused.value = false
          onBlur?.(e)
        }}
        {...rest}
      />
      <Animated.Text style={[{ position: 'absolute', pointerEvents: 'none' }, hintStyle]}>
        {placeholder}
      </Animated.Text>
    </Animated.View>
  )
})
