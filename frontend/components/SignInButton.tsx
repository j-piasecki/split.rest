import { Text } from './Text'
import { Icon } from '@components/Icon'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'

export enum SignInMethod {
  Google = 'google',
  Apple = 'apple',
}

export interface SignInButtonProps {
  onPress: () => void
  method: SignInMethod
  disabled?: boolean
}

export function SignInButton({ onPress, method, disabled = false }: SignInButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const foregroundColor = theme.theme === 'dark' ? 'black' : 'white'
  const backgroundColor = theme.theme === 'dark' ? 'white' : 'black'

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={disabled}
      style={{
        backgroundColor: backgroundColor,
        minWidth: 256,
        minHeight: 44,
        borderRadius: 4,
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        overflow: 'hidden',
        // @ts-expect-error userSelect is not defined on View
        userSelect: 'none',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: foregroundColor,
          opacity: pressed ? 0.2 : hovered ? 0.1 : 0,
        }}
      />

      <Icon
        name={method === SignInMethod.Google ? 'googleLogo' : 'appleLogo'}
        size={20}
        color={method === SignInMethod.Google ? undefined : foregroundColor}
      />
      <Text
        style={{
          color: foregroundColor,
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {method === SignInMethod.Google ? t('login.signInWithGoogle') : t('login.signInWithApple')}
      </Text>
    </Pressable>
  )
}
