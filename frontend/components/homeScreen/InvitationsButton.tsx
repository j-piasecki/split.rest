import { Icon } from '@components/Icon'
import { PaneHeader } from '@components/Pane'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { GroupInvite } from 'shared'

export interface InvitationsButtonProps {
  invites: GroupInvite[]
  isLoadingInvites: boolean
}

export function InvitationsButton({ invites, isLoadingInvites }: InvitationsButtonProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surfaceContainerHighest
            : hovered
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
          borderRadius: 16,
        },
        styles.paneShadow,
      ]}
      onPress={() => router.navigate('/groupInvites')}
    >
      <ShimmerPlaceholder
        argument={isLoadingInvites ? undefined : invites}
        style={{ height: 56 }}
        shimmerStyle={{ backgroundColor: theme.colors.surfaceContainer }}
      >
        {(invites) => (
          <PaneHeader
            icon='stackedEmail'
            title={
              invites.length === 0 ? t('home.noGroupInvitesButton') : t('home.showGroupInvites')
            }
            textLocation='start'
            showSeparator={false}
            adjustsFontSizeToFit
            rightComponent={
              <Icon size={24} name={'chevronForward'} color={theme.colors.secondary} />
            }
          />
        )}
      </ShimmerPlaceholder>
    </Pressable>
  )
}
