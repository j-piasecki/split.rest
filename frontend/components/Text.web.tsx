import React, { useLayoutEffect, useRef } from 'react'
import { Platform } from 'react-native'
// eslint-disable-next-line no-restricted-imports
import { StyleSheet, Text as TextNative, TextProps } from 'react-native'

export function Text({ style, adjustsFontSizeToFit, numberOfLines, ...props }: TextProps) {
  const textRef = useRef<HTMLElement>(null)
  const flattenedStyle = StyleSheet.flatten(style) || {}

  const originalFontSize = flattenedStyle.fontSize || 16

  useLayoutEffect(() => {
    if (!adjustsFontSizeToFit || !textRef.current) {
      return
    }

    const element = textRef.current

    // 1. Conditionally handle text wrapping based on numberOfLines
    if (!numberOfLines || numberOfLines === 1) {
      // Single line: Force it to not wrap so we can measure horizontal overflow
      element.style.whiteSpace = 'nowrap'
    } else {
      // Multi-line: Allow it to wrap. RN Web's native -webkit-line-clamp
      // will handle restricting the height to the correct number of lines.
      element.style.whiteSpace = 'normal'
    }

    // 2. Helper function to check if text is spilling horizontally OR vertically
    const isOverflowing = () => {
      return (
        element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight
      )
    }

    const fitText = () => {
      let min = 10 // Minimum font size
      let max = originalFontSize
      let bestFit = min

      // Reset to max size first
      element.style.fontSize = `${max}px`

      // If it fits at the maximum size, we are done
      if (!isOverflowing()) {
        return
      }

      // Binary Search
      while (min <= max) {
        const mid = Math.floor((min + max) / 2)
        element.style.fontSize = `${mid}px`

        if (isOverflowing()) {
          // Still overflowing vertically or horizontally, go smaller
          max = mid - 1
        } else {
          // It fits! Save it, but check if we can safely go a bit larger
          bestFit = mid
          min = mid + 1
        }
      }

      // Apply the final calculated size
      element.style.fontSize = `${bestFit - 2}px`
    }

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(fitText)
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [adjustsFontSizeToFit, originalFontSize, numberOfLines])

  return (
    <TextNative
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={textRef as any}
      {...props}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={Platform.OS !== 'web' ? adjustsFontSizeToFit : undefined}
      style={[{ fontFamily: 'Nunito' }, style]}
    />
  )
}
