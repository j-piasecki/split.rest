import { TextInputWithUserSuggestionsProps } from './TextInputWithUserSuggestions'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { Member } from 'shared'

export interface TextInputUserPickerProps extends TextInputWithUserSuggestionsProps {
  user?: Member
  onClearSelection?: () => void
  containerStyle?: StyleProp<ViewStyle>
}

export function TextInputUserPicker({
  user,
  onClearSelection,
  containerStyle,
  autoFocus,
  editable,
  ...rest
}: TextInputUserPickerProps) {
  const theme = useTheme()
  const { t } = useTranslation()
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
        <TextInputWithUserSuggestions
          autoFocus={autoFocus || shouldFocusAfterClear}
          editable={editable}
          {...rest}
        />
      )}

      {user && (
        <Pressable
          disabled={editable === false}
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
          }}
        >
          <ProfilePicture userId={user.id} size={24} />
          <View
            style={{
              flex: 1,
              marginLeft: 6,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                width: '100%',
                color: theme.colors.onSurface,
                fontSize: isSmallScreen ? 16 : 18,
                fontWeight: 600,
              }}
              numberOfLines={1}
            >
              {user.displayName ?? user.name}{' '}
              {user.deleted && (
                <Text style={{ color: theme.colors.outline, fontWeight: 200 }}>
                  {t('deletedUser')}
                </Text>
              )}
            </Text>

            {user.displayName && (
              <Text
                style={{
                  width: '100%',
                  color: theme.colors.outline,
                  fontSize: 10,
                  fontWeight: 600,
                }}
                numberOfLines={1}
              >
                {user.name}
              </Text>
            )}
          </View>
        </Pressable>
      )}
    </View>
  )
}
