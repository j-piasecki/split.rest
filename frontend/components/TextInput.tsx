import { useTheme } from '@styling/theme'
import React from 'react'
import { TextInputProps, TextInput as TextInputRN } from 'react-native'
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
    <Animated.View style={[style, { borderBottomWidth: 1, borderRadius: 4 }, wrapperStyle]}>
      <TextInputRN
        ref={ref}
        style={{
          flex: 1,
          paddingHorizontal: 8,
          paddingBottom: 8,
          paddingTop: 16,
          color: theme.colors.onSurface,
          // @ts-expect-error outlineWidth is from react-native-web to disable the default outline
          outlineWidth: 0,
        }}
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
