import { Image, ImageStyle } from 'expo-image'
import { StyleProp } from 'react-native'

export function getProfilePictureUrl(userId?: string) {
  if (!userId) {
    return undefined
  }

  return __DEV__
    ? `http://localhost:3000/public/${userId}.png`
    : `https://api.split.rest/public/${userId}.png`
}

export interface ProfilePictureProps {
  userId?: string
  size: number
  style?: StyleProp<ImageStyle>
}

export function ProfilePicture({ userId, size, style }: ProfilePictureProps) {
  return (
    <Image
      source={getProfilePictureUrl(userId)}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  )
}
