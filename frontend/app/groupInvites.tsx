import Header from '@components/Header'
import { PaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { PullableFlatList } from '@components/PullableFlatList'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useAcceptInvite } from '@hooks/database/useAcceptInvite'
import { useSetInviteIgnoredMutation } from '@hooks/database/useInviteIgnoredMutation'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroupInvites } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInvite } from 'shared'

function Invite({ invite }: { invite: GroupInvite }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { mutateAsync: setInviteIgnored, isPending: isChangingVisibility } =
    useSetInviteIgnoredMutation(invite.groupInfo.id)
  const { mutateAsync: acceptInvite, isPending: isAcceptingInvite } = useAcceptInvite()

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: isSmallScreen ? 16 : 20,
        backgroundColor: theme.colors.surfaceContainer,
      }}
    >
      <View
        style={{
          opacity: invite.ignored ? 0.7 : 1,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{ flex: 1, fontSize: 18, fontWeight: 600, color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t('home.invitedToGroupMessage')}
          </Text>
          <Text
            style={{ flex: 1, fontSize: 24, fontWeight: 600, color: theme.colors.onSurface }}
            numberOfLines={2}
          >
            {invite.groupInfo.name}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              paddingRight: 8,
              marginTop: 4,
            }}
          >
            <Text
              style={{ color: theme.colors.outline, fontSize: 16, fontWeight: 500, flexShrink: 1 }}
              numberOfLines={1}
            >
              {t('home.invitedBy', { name: invite.createdBy.name })}
            </Text>
            <ProfilePicture size={24} userId={invite.createdBy.id} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
          <RoundIconButton
            icon='check'
            disabled={isChangingVisibility}
            isLoading={isAcceptingInvite}
            onPress={() => {
              acceptInvite(invite.groupInfo.id).then(() => {
                router.navigate(`/group/${invite.groupInfo.id}`)
              })
            }}
          />

          <RoundIconButton
            icon={invite.ignored ? 'visibility' : 'visibilityOff'}
            disabled={isAcceptingInvite}
            isLoading={isChangingVisibility}
            onPress={() => {
              setInviteIgnored(!invite.ignored)
            }}
          />
        </View>
      </View>
    </View>
  )
}

function Divider() {
  const theme = useTheme()
  return <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.outlineVariant }} />
}

export default function Home() {
  const theme = useTheme()
  const { t } = useTranslation()
  const displayClass = useDisplayClass()
  const insets = useSafeAreaInsets()

  const {
    invites,
    isLoading: invitesLoading,
    hasNextPage: hasNextInvites,
    fetchNextPage: getchNextInvites,
    isFetchingNextPage: isFetchingNextInvites,
    isRefetching: isRefetchingInvites,
  } = useUserGroupInvites(false)
  const {
    invites: ignoredInvites,
    isLoading: ignoredInvitesLoading,
    hasNextPage: hasNextIgnoredInvites,
    fetchNextPage: getchNextIgnoredInvites,
    isFetchingNextPage: isFetchingNextIgnoredInvites,
    isRefetching: isRefetchingIgnoredInvites,
  } = useUserGroupInvites(true)

  const [showIgnored, setShowIgnored] = useState(false)

  function refresh() {
    invalidateGroupInvites()
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
          }}
        >
          <PullableFlatList
            data={showIgnored ? ignoredInvites : invites}
            renderPullableHeader={(pullValue) => (
              <Header
                offset={pullValue}
                showBackButton
                isWaiting={
                  invitesLoading ||
                  ignoredInvitesLoading ||
                  isRefetchingInvites ||
                  isRefetchingIgnoredInvites
                }
                onPull={refresh}
              />
            )}
            renderItem={({ item }) => <Invite invite={item} />}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 768,
              paddingHorizontal: 16,
              paddingBottom: 80 + insets.bottom,
              alignSelf: 'center',
              paddingTop: displayClass <= DisplayClass.Medium ? 8 : 0,
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => `${item.groupInfo.id}-${item.ignored}`}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <View style={{ gap: 16 }}>
                <View
                  style={{
                    backgroundColor: theme.colors.surfaceContainer,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <PaneHeader
                    icon='group'
                    title={t('home.groupInvites')}
                    textLocation='start'
                    rightComponentVisible
                    rightComponent={
                      <RoundIconButton
                        icon={showIgnored ? 'visibilityOff' : 'visibility'}
                        onPress={() => setShowIgnored((ignored) => !ignored)}
                      />
                    }
                  />
                </View>
              </View>
            }
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceContainer,
                  paddingVertical: 32,
                }}
              >
                {invitesLoading && <ActivityIndicator color={theme.colors.onSurface} />}
                {!invitesLoading && (
                  <Text style={{ color: theme.colors.outline, fontSize: 20 }}>
                    {showIgnored ? t('home.noIgnoredGroupInvites') : t('home.noGroupInvites')}
                  </Text>
                )}
              </View>
            }
            ListFooterComponent={
              <View
                style={{
                  height: 16,
                  backgroundColor: theme.colors.surfaceContainer,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              />
            }
            onEndReached={() => {
              if (!showIgnored && !isFetchingNextInvites && hasNextInvites) {
                getchNextInvites()
              }

              if (showIgnored && !isFetchingNextIgnoredInvites && hasNextIgnoredInvites) {
                getchNextIgnoredInvites()
              }
            }}
          />
        </View>
      </View>
    </View>
  )
}
