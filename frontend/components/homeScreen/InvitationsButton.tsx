import { PaneButton } from '@components/PaneButton'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { useTheme } from '@styling/theme'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
        />
      )}
    </ShimmerPlaceholder>
  )
}
