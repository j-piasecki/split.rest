import { Icon } from '@components/Icon'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { GroupInviteWithGroupInfo } from 'shared'

export interface InvitationsButtonProps {
  invites: GroupInviteWithGroupInfo[]
  isLoadingInvites: boolean
}

export function InvitationsButton({ invites, isLoadingInvites }: InvitationsButtonProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <ShimmerPlaceholder
      argument={isLoadingInvites ? undefined : invites}
      style={{ height: 48, width: 78, borderRadius: 16 }}
      shimmerStyle={{ backgroundColor: theme.colors.surfaceContainer }}
    >
      {(invites) => (
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={
            invites.length > 0 ? t('home.showGroupInvites') : t('home.noGroupInvitesButton')
          }
          onPress={() => router.push('/groupInvites')}
          style={({ pressed, hovered }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            height: 48,
            borderRadius: 16,
            backgroundColor: pressed
              ? theme.colors.surfaceContainerHighest
              : hovered
                ? theme.colors.surfaceContainerHigh
                : theme.colors.surfaceContainer,
          })}
        >
          <Icon name='stackedEmail' size={24} color={theme.colors.secondary} />

          {invites.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 22,
                left: 30,
                width: 18,
                height: 18,
                backgroundColor: theme.colors.error,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: theme.colors.onError, fontSize: 12, fontWeight: '700' }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {invites.length > 9 ? '9+' : invites.length}
              </Text>
            </View>
          )}

          <Icon name='chevronForward' size={22} color={theme.colors.secondary} />
        </Pressable>
      )}
    </ShimmerPlaceholder>
  )
}
