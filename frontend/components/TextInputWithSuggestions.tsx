import { Props, TextInput, TextInputRef } from './TextInput'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, View, ViewStyle } from 'react-native'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import { useDebounce } from 'use-debounce'

type SuggestionRenderFunction<T> = (
  suggestion: T,
  hovered: boolean,
  pressed: boolean
) => React.ReactNode

interface SuggestionContainerProps<T> {
  inputRef: React.RefObject<TextInputRef | null>
  renderSuggestion: SuggestionRenderFunction<T>
  suggestion: T
  last?: boolean
  onSelect?: (suggestion: T) => void
  highlighted?: boolean
}

function SuggestionContainer<T>({
  inputRef,
  renderSuggestion,
  suggestion,
  onSelect,
  highlighted,
  last,
}: SuggestionContainerProps<T>) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      tabIndex={-1}
      style={{
        borderBottomLeftRadius: last ? 12 : 0,
        borderBottomRightRadius: last ? 12 : 0,
        overflow: 'hidden',
      }}
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
      {renderSuggestion(suggestion, highlighted ?? hovered, pressed)}
    </Pressable>
  )
}

export interface TextInputWithSuggestionsProps<T> extends Props {
  inputRef?: React.Ref<TextInputRef | null>
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
  onChangeText,
  onSubmitEditing,
  ...rest
}: TextInputWithSuggestionsProps<T>) {
  const theme = useTheme()
  const suggestionBoxRef = useRef<View>(null)
  const textInputRef: React.MutableRefObject<TextInputRef | null> = useRef<TextInputRef>(null)
  const [suggestions, setSuggestions] = useState<T[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [debouncedValue] = useDebounce(value, 300)
  const [inputLayout, setInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [suggestionBoxHeight, setSuggestionBoxHeight] = useState(0)
  const [isFocusedDebounced] = useDebounce(isFocused, 100)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const [keyboardHighligtedSuggestion, setKeyboardHighlightedSuggestion] = useState<number | null>(
    null
  )

  const selectSuggestion = (suggestion: T) => {
    onSuggestionSelect?.(suggestion)
    setShowSuggestions(false)
    textInputRef.current?.focusNext()
  }

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
      setSuggestionBoxHeight(measure(suggestionBoxRef.current).height)
    }
  }, [suggestions, isFocused, suggestionsVisible, showSuggestions, value, isFocusedDebounced])

  const suggestionBoxVisible =
    isFocusedDebounced &&
    value !== undefined &&
    value.length > 0 &&
    suggestions.length > 0 &&
    suggestionsVisible &&
    showSuggestions

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
            // eslint-disable-next-line react-compiler/react-compiler
            inputRef.current = ref
          }
        }}
        {...rest}
        value={value}
        onChangeText={(text) => {
          onChangeText?.(text)
          setShowSuggestions(true)
          setKeyboardHighlightedSuggestion(null)
        }}
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

          if (e.defaultPrevented) {
            return
          }

          if (e.nativeEvent.key === 'ArrowDown' && suggestions.length > 0) {
            e.preventDefault()
            setKeyboardHighlightedSuggestion((prev) =>
              prev === null ? 0 : Math.min(prev + 1, suggestions.length - 1)
            )
          } else if (e.nativeEvent.key === 'ArrowUp' && suggestions.length > 0) {
            e.preventDefault()
            setKeyboardHighlightedSuggestion((prev) =>
              prev === null ? suggestions.length - 1 : Math.max(prev - 1, 0)
            )
          } else if (
            e.nativeEvent.key === 'Enter' &&
            (keyboardHighligtedSuggestion !== null || suggestions.length > 0)
          ) {
            e.preventDefault()
            selectSuggestion(suggestions[keyboardHighligtedSuggestion ?? 0])
            setKeyboardHighlightedSuggestion(null)
          } else if (e.nativeEvent.key === 'Escape' && suggestionBoxVisible) {
            e.preventDefault()
            setShowSuggestions(false)
            setKeyboardHighlightedSuggestion(null)
          }
        }}
        onSubmitEditing={(e) => {
          if (keyboardHighligtedSuggestion !== null || suggestions.length > 0) {
            e.preventDefault()
            selectSuggestion(suggestions[keyboardHighligtedSuggestion ?? 0])
            setKeyboardHighlightedSuggestion(null)
          } else {
            onSubmitEditing?.(e)
          }
        }}
      />
      {suggestionBoxVisible && (
        <Animated.View
          entering={FadeInUp.duration(150)}
          exiting={FadeOutDown.duration(150)}
          ref={suggestionBoxRef}
          style={{
            position: 'absolute',
            left: 4,
            bottom: -suggestionBoxHeight,
            width: inputLayout.width - 8,
            maxHeight: 160,
            backgroundColor: theme.colors.surfaceContainerHigh,
            opacity: suggestionBoxHeight > 0 ? 1 : 0,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderColor: theme.colors.outlineVariant,
            borderWidth: 1,
            borderTopWidth: 0,
            overflow: 'hidden',
          }}
        >
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='always'>
            {suggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <SuggestionContainer
                  inputRef={textInputRef}
                  renderSuggestion={renderSuggestion}
                  suggestion={suggestion}
                  onSelect={selectSuggestion}
                  last={index === suggestions.length - 1}
                  highlighted={
                    keyboardHighligtedSuggestion === null
                      ? undefined
                      : index === keyboardHighligtedSuggestion
                  }
                />
                {index < suggestions.length - 1 && (
                  <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant }} />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}
