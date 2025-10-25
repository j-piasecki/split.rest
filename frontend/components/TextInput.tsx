import { useFormContext } from './Form'
import { useTheme } from '@styling/theme'
import { resolveFontName } from '@utils/resolveFontName'
import React, { useImperativeHandle, useMemo, useRef } from 'react'
import {
  Platform,
  Pressable,
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
  showUnderline?: boolean
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
    showUnderline = true,
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

  const textWrapperStyle = useAnimatedStyle(() => {
    return {
      paddingTop: withTiming(value ? 16 : 12, { duration: 200 }),
      paddingBottom: withTiming(value ? 8 : 12, { duration: 200 }),
    }
  })

  const hintWrapperStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(value ? 0 : 8, { duration: 200 }),
      top: withTiming(value ? -2 : 12, { duration: 200 }),
      transform: [{ scale: withTiming(value ? 0.7 : 1, { duration: 200 }) }],
    }
  })

  const hintStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isFocused.value ? theme.colors.primary : theme.colors.outline, {
        duration: 200,
      }),
    }
  })

  return (
    <Animated.View
      style={[
        style as ViewStyle,
        { borderBottomWidth: showUnderline ? 1 : 0, borderRadius: 2 },
        wrapperStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          if (rest.editable !== false) {
            inputRef.current?.focus()
          }
        }}
      >
        <Animated.View
          style={[
            textWrapperStyle,
            {
              paddingHorizontal: 8,
            },
          ]}
        >
          <TextInputRN
            ref={inputRef}
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
            style={[
              {
                color: theme.colors.onSurface,
                fontWeight: '600',
                fontSize: 14,
                padding: 0,
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
        </Animated.View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              pointerEvents: 'none',
              transformOrigin: 'left',
            },
            hintWrapperStyle,
          ]}
        >
          <Animated.Text style={[{ fontFamily: resolveFontName() }, hintStyle, inputStyle]}>
            {placeholder}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
})
