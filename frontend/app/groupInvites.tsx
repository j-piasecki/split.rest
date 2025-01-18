import Header from '@components/Header'
import { PaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { PullableFlatList } from '@components/PullableFlatList'
import { RoundIconButton } from '@components/RoundIconButton'
import { Shimmer } from '@components/Shimmer'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useAcceptInvite } from '@hooks/database/useAcceptInvite'
import { useSetInviteRejectedMutation } from '@hooks/database/useInviteRejectedMutation'
import { useUserGroupInvites } from '@hooks/database/useUserGroupInvites'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { invalidateGroupInvites } from '@utils/queryClient'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInvite } from 'shared'

function Invite({ invite }: { invite: GroupInvite }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const snack = useSnack()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { mutateAsync: setInviteRejected, isPending: isChangingVisibility } =
    useSetInviteRejectedMutation(invite.groupInfo.id)
  const { mutateAsync: acceptInvite, isPending: isAcceptingInvite } = useAcceptInvite()

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: 16,
        paddingRight: 8,
        paddingTop: isSmallScreen ? 16 : 20,
        paddingBottom: 4,
        backgroundColor: theme.colors.surfaceContainer,
      }}
    >
      <View
        style={{
          opacity: invite.rejected ? 0.7 : 1,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 18, fontWeight: 600, color: theme.colors.onSurfaceVariant }}
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
            icon={'close'}
            disabled={isAcceptingInvite}
            isLoading={isChangingVisibility}
            onPress={() => {
              setInviteRejected(true).then(() => {
                snack.show(
                  t('home.rejectedInvite', { name: invite.groupInfo.name }),
                  t('home.undoReject'),
                  async () => {
                    await setInviteRejected(false)
                  }
                )
              })
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

function InvitesShimmer({ count }: { count: number }) {
  return (
    <View style={{ width: '100%' }}>
      {new Array(count).fill(0).map((_, index) => {
        const offset = 1 - index * 0.05
        return (
          <React.Fragment key={index}>
            <View style={{ width: '100%', padding: 16, gap: 8 }}>
              <Shimmer
                offset={offset}
                style={{
                  width: '50%',
                  height: 20,
                  borderRadius: 10,
                }}
              />
              <Shimmer
                offset={offset}
                style={{
                  width: '100%',
                  height: 24,
                  borderRadius: 12,
                }}
              />
              <Shimmer
                offset={offset}
                style={{
                  width: '50%',
                  height: 20,
                  borderRadius: 10,
                }}
              />
              <Shimmer
                offset={offset - 0.1}
                style={{
                  width: 96,
                  height: 28,
                  borderRadius: 12,
                  alignSelf: 'flex-end',
                }}
              />
            </View>
            {index !== count - 1 && <Divider />}
          </React.Fragment>
        )
      })}
    </View>
  )
}

export default function Invites() {
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
    error: invitesError,
  } = useUserGroupInvites(false)

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
            data={invites}
            renderPullableHeader={(pullValue) => (
              <Header
                offset={pullValue}
                showBackButton
                isWaiting={invitesLoading || isRefetchingInvites}
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
            keyExtractor={(item) => `${item.groupInfo.id}-${item.rejected}`}
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
                    icon='stackedEmail'
                    title={t('home.groupInvites')}
                    textLocation='start'
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
                }}
              >
                {invitesLoading && <InvitesShimmer count={3} />}
                {!invitesLoading && (
                  <Text style={{ color: theme.colors.outline, fontSize: 20, paddingVertical: 32 }}>
                    {t(invitesError ? 'home.errorLoadingInvites' : 'home.noGroupInvites')}
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
              if (!isFetchingNextInvites && hasNextInvites) {
                getchNextInvites()
              }
            }}
          />
        </View>
      </View>
    </View>
  )
}
