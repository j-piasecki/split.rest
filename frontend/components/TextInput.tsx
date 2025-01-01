import { useFormContext } from './Form'
import { useTheme } from '@styling/theme'
import { resolveFontName } from '@utils/resolveFontName'
import React, { useImperativeHandle, useMemo, useRef } from 'react'
import {
  Platform,
  StyleProp,
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
  inputStyle?: StyleProp<TextStyle>
  focusIndex?: number
}

export interface TextInputRef {
  focus(): void
  blur(): void
  focusNext(): void
}

export const TextInput = React.forwardRef<TextInputRef, Props>(function TextInput(
  {
    style,
    placeholder,
    value,
    onChangeText,
    error,
    resetError,
    onFocus,
    onBlur,
    inputStyle,
    onSubmitEditing,
    submitBehavior,
    ...rest
  }: Props,
  ref
) {
  const theme = useTheme()
  const inputRef = useRef<TextInputRN | null>(null)
  const isFocused = useSharedValue(false)

  const form = useFormContext(inputRef, rest.focusIndex)

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

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    },
    blur: () => {
      inputRef.current?.blur()
    },
    focusNext: () => {
      form?.focusNext()
    },
  }))

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
      left: withTiming(value ? 0 : 8, { duration: 200 }),
      top: withTiming(value ? -2 : 16, { duration: 200 }),
      transform: [{ scale: withTiming(value ? 0.7 : 1, { duration: 200 }) }],
      color: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  return (
    <Animated.View
      style={[style as ViewStyle, { borderBottomWidth: 1, borderRadius: 2 }, wrapperStyle]}
    >
      <TextInputRN
        ref={inputRef}
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
          inputStyle,
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
        submitBehavior={(submitBehavior ?? form === null) ? undefined : 'submit'}
        onSubmitEditing={(e) => {
          onSubmitEditing?.(e)
          form?.focusNext()
        }}
        numberOfLines={1}
        {...rest}
      />
      <Animated.Text
        style={[
          {
            position: 'absolute',
            pointerEvents: 'none',
            transformOrigin: 'left',
            fontFamily: resolveFontName(),
          },
          hintStyle,
        ]}
      >
        {placeholder}
      </Animated.Text>
    </Animated.View>
  )
})
