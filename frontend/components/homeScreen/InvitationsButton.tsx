import { PaneButton } from '@components/PaneButton'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
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
      style={{ height: 56 }}
      shimmerStyle={{ backgroundColor: theme.colors.surfaceContainer }}
    >
      {(invites) => (
        <PaneButton
          onPress={() => router.push('/groupInvites')}
          icon='stackedEmail'
          title={invites.length === 0 ? t('home.noGroupInvitesButton') : t('home.showGroupInvites')}
          rightComponent={
            invites.length > 0 && (
              <View
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: theme.colors.error,
                  borderRadius: 13,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.onError, fontSize: 15, fontWeight: '700' }}>
                  {invites.length > 9 ? '9+' : invites.length}
                </Text>
              </View>
            )
          }
        />
      )}
    </ShimmerPlaceholder>
  )
}
