import { Props, TextInput } from './TextInput'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, TextInput as TextInputRN, View, ViewStyle } from 'react-native'
import { useDebounce } from 'use-debounce'

type SuggestionRenderFunction<T> = (
  suggestion: T,
  hovered: boolean,
  pressed: boolean
) => React.ReactNode

interface SuggestionContainerProps<T> {
  inputRef: React.RefObject<TextInputRN | null>
  renderSuggestion: SuggestionRenderFunction<T>
  suggestion: T
  onSelect?: (suggestion: T) => void
}

function SuggestionContainer<T>({
  inputRef,
  renderSuggestion,
  suggestion,
  onSelect,
}: SuggestionContainerProps<T>) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPressIn={() => {
        setPressed(true)
        inputRef.current?.focus()
      }}
      onHoverIn={() => {
        setHovered(true)
      }}
      onHoverOut={() => {
        setHovered(false)
        setPressed(false)
      }}
      onPointerUp={() => {
        // onPressOut isn't called on web due to focus shenanigans
        setPressed(false)
      }}
      onPressOut={() => {
        setPressed(false)
      }}
      onPress={() => {
        onSelect?.(suggestion)
      }}
    >
      {renderSuggestion(suggestion, hovered, pressed)}
    </Pressable>
  )
}

export interface TextInputWithSuggestionsProps<T> extends Props {
  inputRef?: React.Ref<TextInputRN | null>
  getSuggestions: (value: string) => Promise<T[]>
  renderSuggestion: SuggestionRenderFunction<T>
  onSuggestionSelect?: (suggestion: T) => void
  suggestionsVisible?: boolean
}

export function TextInputWithSuggestions<T>({
  style,
  value,
  getSuggestions,
  renderSuggestion,
  suggestionsVisible = true,
  onSuggestionSelect,
  onFocus,
  onBlur,
  inputRef,
  onKeyPress,
  ...rest
}: TextInputWithSuggestionsProps<T>) {
  const theme = useTheme()
  const suggestionBoxRef = useRef<View>(null)
  const textInputRef: React.MutableRefObject<TextInputRN | null> = useRef<TextInputRN>(null)
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

  const suggestionBoxVisible =
    isFocusedDebounced &&
    value !== undefined &&
    value.length > 0 &&
    suggestions.length > 0 &&
    suggestionsVisible

  return (
    <View
      style={[style as ViewStyle, { position: 'relative' }]}
      onLayout={(event) => {
        setInputLayout(event.nativeEvent.layout)
      }}
    >
      <TextInput
        ref={(ref) => {
          textInputRef.current = ref
          if (typeof inputRef === 'function') {
            inputRef(ref)
          } else if (inputRef) {
            // @ts-expect-error react types are weird
            inputRef.current = ref
          }
        }}
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
        onKeyPress={(e) => {
          onKeyPress?.(e)
        }}
      />
      {suggestionBoxVisible && (
        <View
          ref={suggestionBoxRef}
          style={{
            position: 'absolute',
            left: 4,
            bottom: -suggestionBoxHeight,
            width: inputLayout.width - 8,
            maxHeight: 150,
            backgroundColor: theme.colors.surfaceContainer,
            opacity: suggestionBoxHeight > 0 ? 1 : 0,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderColor: theme.colors.outlineVariant,
            borderWidth: 1,
            borderTopWidth: 0,
            overflow: 'hidden',
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            {suggestions.map((suggestion, index) => (
              <>
                <SuggestionContainer
                  key={index}
                  inputRef={textInputRef}
                  renderSuggestion={renderSuggestion}
                  suggestion={suggestion}
                  onSelect={onSuggestionSelect}
                />
                {index < suggestions.length - 1 && (
                  <View
                    key={`separator-${index}`}
                    style={{ height: 1, backgroundColor: theme.colors.outlineVariant }}
                  />
                )}
              </>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
