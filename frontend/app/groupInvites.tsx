import { FlatListWithHeader } from '@components/FlatListWithHeader'
import { ListEmptyComponent } from '@components/ListEmptyComponent'
import { FullPaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
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
import { StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInviteWithGroupInfo } from 'shared'

function Invite({
  invite,
  style,
}: {
  invite: GroupInviteWithGroupInfo
  style?: StyleProp<ViewStyle>
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const snack = useSnack()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { mutateAsync: setInviteRejected, isPending: isChangingVisibility } =
    useSetInviteRejectedMutation(invite.groupInfo.id)
  const { mutateAsync: acceptInvite, isPending: isAcceptingInvite } = useAcceptInvite()

  return (
    <View
      style={[
        {
          flex: 1,
          paddingLeft: 16,
          paddingRight: 8,
          paddingTop: isSmallScreen ? 16 : 20,
          paddingBottom: 4,
          backgroundColor: theme.colors.surfaceContainer,
        },
        style,
      ]}
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
                snack.show({
                  message: t('home.rejectedInvite', { name: invite.groupInfo.name }),
                  actionText: t('undo'),
                  action: async () => {
                    await setInviteRejected(false)
                  },
                })
              })
            }}
          />
        </View>
      </View>
    </View>
  )
}

function Divider() {
  return <View style={{ width: '100%', height: 2, backgroundColor: 'transparent' }} />
}

function InvitesShimmer({ count }: { count: number }) {
  const theme = useTheme()

  return (
    <View style={{ width: '100%' }}>
      {new Array(count).fill(0).map((_, index) => {
        const offset = 1 - index * 0.05
        return (
          <React.Fragment key={index}>
            <View
              style={[
                {
                  width: '100%',
                  padding: 16,
                  gap: 8,
                  backgroundColor: theme.colors.surfaceContainer,
                  borderRadius: 4,
                },
                index === count - 1 && {
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                },
              ]}
            >
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
          <FlatListWithHeader
            data={invites}
            showBackButton
            refreshing={invitesLoading || isRefetchingInvites}
            onRefresh={refresh}
            renderItem={({ item, index }) => (
              <Invite
                invite={item}
                style={[
                  { borderRadius: 4 },
                  index === invites.length - 1 && {
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  },
                ]}
              />
            )}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 768,
              paddingHorizontal: 12,
              paddingBottom: 88 + insets.bottom,
              alignSelf: 'center',
              paddingTop: displayClass <= DisplayClass.Medium ? 8 : 0,
            }}
            onEndReachedThreshold={0.5}
            keyExtractor={(item) => `${item.groupInfo.id}-${item.rejected}`}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <FullPaneHeader
                icon='stackedEmail'
                title={t('home.groupInvites')}
                textLocation='start'
              />
            }
            ListEmptyComponent={
              <ListEmptyComponent
                isLoading={invitesLoading}
                emptyText={t(invitesError ? 'home.errorLoadingInvites' : 'home.noGroupInvites')}
                loadingPlaceholder={<InvitesShimmer count={3} />}
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
