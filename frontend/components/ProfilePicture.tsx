import { useTheme } from '@styling/theme'
import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

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
  style?: StyleProp<ViewStyle>
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultProfilePicture = require('@assets/icons/user.svg')

export function ProfilePicture({ userId, size, style }: ProfilePictureProps) {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const imageSize = failed ? size * 0.65 : size

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isLoading || failed ? theme.colors.surfaceBright : undefined,
        },
        style,
      ]}
    >
      <Image
        source={failed ? defaultProfilePicture : getProfilePictureUrl(userId)}
        placeholder={defaultProfilePicture}
        cachePolicy='memory-disk'
        onError={() => {
          setFailed(true)
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
        tintColor={failed ? theme.colors.secondary : undefined}
        style={[
          {
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
          },
        ]}
      />
    </View>
  )
}
