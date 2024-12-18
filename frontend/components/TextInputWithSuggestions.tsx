import { Props, TextInput } from './TextInput'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollView, TextInput as TextInputRN, View, ViewStyle } from 'react-native'
import { useDebounce } from 'use-debounce'

export interface TextInputWithSuggestionsProps<T> extends Props {
  inputRef?: React.Ref<TextInputRN>
  getSuggestions: (value: string) => Promise<T[]>
  renderSuggestion: (suggestion: T) => React.ReactNode
  suggestionsVisible?: boolean
}

export function TextInputWithSuggestions<T>({
  style,
  value,
  getSuggestions,
  renderSuggestion,
  suggestionsVisible = true,
  onFocus,
  onBlur,
  inputRef,
  ...rest
}: TextInputWithSuggestionsProps<T>) {
  const theme = useTheme()
  const suggestionBoxRef = useRef<View>(null)
  const [suggestions, setSuggestions] = useState<T[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [debouncedValue] = useDebounce(value, 300)
  const [inputLayout, setInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [suggestionBoxHeight, setSuggestionBoxHeight] = useState(0)
  const [isFocusedDebounced] = useDebounce(isFocused, 100)

  useEffect(() => {
    if (isFocusedDebounced && debouncedValue && debouncedValue.length > 0) {
      getSuggestions(debouncedValue)
        .then(setSuggestions)
        .catch((error) => {
          console.error('Error getting suggestions', error)
        })
    } else {
      setSuggestions([])
    }
  }, [debouncedValue, getSuggestions, isFocusedDebounced])

  useLayoutEffect(() => {
    if (suggestionBoxRef.current) {
      setSuggestionBoxHeight(measure(suggestionBoxRef).height)
    }
  }, [suggestions, isFocused, suggestionsVisible, value, isFocusedDebounced])

  return (
    <View
      style={[style as ViewStyle, { position: 'relative' }]}
      onLayout={(event) => {
        setInputLayout(event.nativeEvent.layout)
      }}
    >
      <TextInput
        ref={inputRef}
        {...rest}
        value={value}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
      />
      {isFocusedDebounced &&
        value !== undefined &&
        value.length > 0 &&
        suggestions.length > 0 &&
        suggestionsVisible && (
          <View
            ref={suggestionBoxRef}
            style={{
              position: 'absolute',
              left: 8,
              bottom: -suggestionBoxHeight,
              width: inputLayout.width - 16,
              maxHeight: 150,
              backgroundColor: theme.colors.surfaceContainer,
              opacity: suggestionBoxHeight > 0 ? 1 : 0,
            }}
          >
            <ScrollView style={{ flex: 1 }}>
              {suggestions.map((suggestion, index) => (
                <View key={index}>{renderSuggestion(suggestion)}</View>
              ))}
            </ScrollView>
          </View>
        )}
    </View>
  )
}
