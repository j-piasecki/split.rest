import { PaneButton } from '@components/PaneButton'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated'
import { GroupUserInfo } from 'shared'

export function MembersButton({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { members, isLoading } = useGroupMembers(info?.id, true)
  const iconsRef = useRef<View>(null)
  const [iconsToShow, setIconsToShow] = useState(20)
  const { width } = useWindowDimensions()

  const singleIconSize = 28

  useLayoutEffect(() => {
    const width = measure(iconsRef.current!).width
    const fittingIcons = Math.floor(width / singleIconSize)

    if (fittingIcons >= members.length) {
      setIconsToShow(members.length)
    } else {
      setIconsToShow(Math.max(Math.min(fittingIcons - 1, members.length), 0))
    }
  }, [width, members.length])

  return (
    <PaneButton
      icon='members'
      title={t('tabs.members')}
      adjustsFontSizeToFit={false}
      onPress={() => {
        router.navigate(`/group/${info?.id}/members`)
      }}
      rightComponent={
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <View
            ref={iconsRef}
            style={{
              flex: 1,
              height: 40,
              overflow: 'hidden',
            }}
          >
            <ShimmerPlaceholder
              style={{
                flex: 1,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
              shimmerStyle={{
                width: iconsToShow > 0 ? '75%' : 0,
                minWidth: iconsToShow > 0 ? singleIconSize : 0,
                height: 28,
                alignSelf: 'flex-end',
              }}
              argument={info === undefined || isLoading ? undefined : members}
            >
              {members.slice(0, iconsToShow).map((member, index) => {
                return (
                  <Bubble
                    key={member.id}
                    translateX={index * 8}
                    delay={index * 50 + (Platform.OS !== 'web' ? 175 : 0)}
                  >
                    <ProfilePicture userId={member.id} size={singleIconSize} />
                  </Bubble>
                )
              })}

              {info?.memberCount && info.memberCount > iconsToShow && (
                <Bubble
                  translateX={iconsToShow * 8}
                  delay={iconsToShow * 50 + (Platform.OS !== 'web' ? 250 : 75)}
                  border={false}
                >
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        backgroundColor: theme.colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 2,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      ellipsizeMode='clip'
                      style={{
                        fontSize: Platform.OS === 'web' ? 14 : 16,
                        color: theme.colors.onPrimary,
                        fontWeight: '600',
                      }}
                    >
                      +{info.memberCount - iconsToShow}
                    </Text>
                  </View>
                </Bubble>
              )}
            </ShimmerPlaceholder>
          </View>
        </View>
      }
    />
  )
}

function Bubble({
  children,
  translateX,
  delay,
  border = true,
}: {
  children: React.ReactNode
  translateX: number
  delay: number
  border?: boolean
}) {
  const theme = useTheme()
  const scale = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX }, { scale: scale.value }],
    }
  })

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { mass: 1, damping: 15, stiffness: 150 }))
  }, [delay, scale])

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 32,
          height: 32,
          borderRadius: 16,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: border ? 2 : 0,
          borderColor: theme.colors.surfaceContainer,
          backgroundColor: theme.colors.surfaceContainer,
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
