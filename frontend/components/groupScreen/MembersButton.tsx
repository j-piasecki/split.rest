import { PaneButton } from '@components/PaneButton'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import { measure } from '@utils/measure'
import { useRouter } from 'expo-router'
import React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, useWindowDimensions } from 'react-native'
import { GroupUserInfo } from 'shared'

export function MembersButton({ info }: { info: GroupUserInfo | undefined }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { members, isLoading } = useGroupMembers(info?.id)
  const iconsRef = useRef<View>(null)
  const [iconsToShow, setIconsToShow] = useState(20)
  const { width } = useWindowDimensions()

  const singleIconSize = 28

  useLayoutEffect(() => {
    const width = measure(iconsRef.current!).width

    setIconsToShow(Math.floor(width / singleIconSize))
  }, [width])

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
                  <View
                    key={member.id}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: theme.colors.surfaceContainer,
                      transform: [{ translateX: index * 8 }],
                      overflow: 'hidden',
                    }}
                  >
                    <ProfilePicture userId={member.id} size={singleIconSize} />
                  </View>
                )
              })}
            </ShimmerPlaceholder>
          </View>
        </View>
      }
    />
  )
}
