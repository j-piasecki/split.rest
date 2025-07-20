import { Icon, IconName } from './Icon'
import { TextInput, TextInputRef } from './TextInput'
import { useTheme } from '@styling/theme'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { useRef } from 'react'
import { KeyboardTypeOptions, Pressable } from 'react-native'

interface LargeTextInputProps {
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: KeyboardTypeOptions
  icon?: IconName
}

export function LargeTextInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  icon,
}: LargeTextInputProps) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
  const textInputRef = useRef<TextInputRef>(null)

  return (
    <Pressable
      style={{
        padding: threeBarLayout ? 8 : 12,
        paddingLeft: threeBarLayout ? 16 : 24,
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceContainer,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
      onPress={() => textInputRef.current?.focus()}
    >
      {icon && <Icon name={icon} size={threeBarLayout ? 20 : 24} color={theme.colors.secondary} />}
      <TextInput
        ref={textInputRef}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1 }}
        inputStyle={{ fontSize: threeBarLayout ? 16 : 18 }}
        showUnderline={false}
        keyboardType={keyboardType}
      />
    </Pressable>
  )
}
