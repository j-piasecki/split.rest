import { Icon, IconName } from './Icon'
import { TextInput, TextInputRef } from './TextInput'
import { useTheme } from '@styling/theme'
import { useAppLayout } from '@utils/dimensionUtils'
import { useRef } from 'react'
import { KeyboardTypeOptions, Pressable, StyleProp, ViewStyle } from 'react-native'

interface LargeTextInputProps {
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: KeyboardTypeOptions
  icon?: IconName
  onFocus?: () => void
  onBlur?: () => void
  containerStyle?: StyleProp<ViewStyle>
  disabled?: boolean
  onSubmit?: () => void
  autoCorrect?: boolean
}

export function LargeTextInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  icon,
  onFocus,
  onBlur,
  containerStyle,
  disabled = false,
  onSubmit,
  autoCorrect,
}: LargeTextInputProps) {
  const theme = useTheme()
  const { threePaneLayout } = useAppLayout()
  const textInputRef = useRef<TextInputRef>(null)

  return (
    <Pressable
      disabled={disabled}
      style={[
        {
          padding: threePaneLayout.enabled ? 8 : 12,
          paddingLeft: threePaneLayout.enabled ? 16 : 24,
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceContainer,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        containerStyle,
      ]}
      onPress={() => textInputRef.current?.focus()}
    >
      {icon && (
        <Icon
          name={icon}
          size={threePaneLayout.enabled ? 20 : 24}
          color={theme.colors.secondary}
          style={{ opacity: disabled ? 0.7 : 1 }}
        />
      )}
      <TextInput
        ref={textInputRef}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1, opacity: disabled ? 0.7 : 1 }}
        inputStyle={{ fontSize: threePaneLayout.enabled ? 16 : 18 }}
        showUnderline={false}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!disabled}
        onSubmitEditing={onSubmit}
        autoCorrect={autoCorrect}
      />
    </Pressable>
  )
}
