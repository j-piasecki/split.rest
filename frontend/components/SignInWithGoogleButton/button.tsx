import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

export interface SignInWithGoogleButtonProps {
  onPress: () => void
}

export function SignInWithGoogleButton(props: SignInWithGoogleButtonProps) {
  return (
    <GoogleSigninButton
              style={{ width: 256, height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={props.onPress}
            />
  )
}