import { TextInputWithUserSuggestionsProps } from './TextInputWithUserSuggestions'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { User } from 'shared'

export interface TextInputUserPickerProps extends TextInputWithUserSuggestionsProps {
  user?: User
  onClearSelection?: () => void
  containerStyle?: StyleProp<ViewStyle>
}

export function TextInputUserPicker({
  user,
  onClearSelection,
  containerStyle,
  autoFocus,
  ...rest
}: TextInputUserPickerProps) {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const [shouldFocusAfterClear, setShouldFocusAfterClear] = useState(false)

  useEffect(() => {
    if (shouldFocusAfterClear) {
      setShouldFocusAfterClear(false)
    }
  }, [shouldFocusAfterClear])

  return (
    <View style={containerStyle}>
      {!user && (
        <TextInputWithUserSuggestions autoFocus={autoFocus || shouldFocusAfterClear} {...rest} />
      )}

      {user && (
        <Pressable
          onPress={() => {
            onClearSelection?.()
            setShouldFocusAfterClear(true)
          }}
          tabIndex={-1}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 4,
            paddingVertical: 8,
            marginTop: 4,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
          }}
        >
          <ProfilePicture userId={user.id} size={isSmallScreen ? 20 : 24} />
          <Text
            style={{
              flex: 1,
              marginLeft: 6,
              color: theme.colors.onSurface,
              fontSize: isSmallScreen ? 16 : 18,
              fontWeight: 600,
            }}
            numberOfLines={1}
          >
            {user.name}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
