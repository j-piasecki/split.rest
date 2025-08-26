import { Shimmer } from './Shimmer'
import { useTheme } from '@styling/theme'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { GroupInfo } from 'shared'

export function getGroupIconUrl(info?: GroupInfo) {
  if (!info?.icon) {
    return undefined
  }

  return __DEV__
    ? `http://localhost:3000/public/groupIcon/${info.icon}.jpg`
    : `https://assets.split.rest/group-icons/${info.icon}.jpg`
}

export interface GroupIconProps {
  info?: GroupInfo
  size: number
  style?: StyleProp<ViewStyle>
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultGroupIcon = require('@assets/icons/group.svg')

export function GroupIcon({ info, size, style }: GroupIconProps) {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const imageSize = failed ? Math.min(size * 0.5, 44) : size

  useEffect(() => {
    if (!info?.icon) {
      setFailed(true)
      setIsLoading(false)
    }
  }, [info?.icon])

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isLoading || failed ? theme.colors.surfaceBright : undefined,
        },
        style,
      ]}
    >
      {isLoading && (
        <Shimmer
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: size / 4,
          }}
        />
      )}
      <Image
        source={failed ? defaultGroupIcon : getGroupIconUrl(info)}
        placeholder={defaultGroupIcon}
        cachePolicy='memory-disk'
        onError={() => {
          setFailed(true)
          setIsLoading(false)
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
        tintColor={isLoading || failed ? theme.colors.secondary : undefined}
        style={[
          {
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 4,
          },
        ]}
      />
    </View>
  )
}
