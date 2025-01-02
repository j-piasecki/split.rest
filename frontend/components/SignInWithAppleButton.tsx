import { Text } from './Text'
import { Icon } from '@components/Icon'
import { useTheme } from '@styling/theme'
import { Pressable } from 'react-native'

export interface SignInWithAppleButtonProps {
  onPress: () => void
}

export function SignInWithAppleButton(props: SignInWithAppleButtonProps) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={props.onPress}
      style={{
        backgroundColor: theme.theme === 'dark' ? 'white' : 'black',
        width: 256,
        height: 48,
        borderRadius: 5,
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
      }}
    >
      <Icon name='appleLogo' size={20} color={theme.theme === 'dark' ? 'black' : 'white'} />
      <Text
        style={{
          color: theme.theme === 'dark' ? 'black' : 'white',
          fontSize: 16,
          fontWeight: 600,
          flex: 1,
          textAlign: 'center',
        }}
      >
        Sign in with Apple
      </Text>
    </Pressable>
  )
}