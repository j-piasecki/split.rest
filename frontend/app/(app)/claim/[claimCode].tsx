import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { ErrorText } from '@components/ErrorText'
import Header from '@components/Header'
import { InvitePane } from '@components/InvitePane'
import { FullPaneHeader } from '@components/Pane'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { SplitsList } from '@components/groupScreen/SplitsList'
import { useClaimGhostUser } from '@hooks/database/useClaimGhostUser'
import { useGroupInviteByClaimCode } from '@hooks/database/useGroupInviteByClaimCode'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getBalanceColor } from '@utils/getBalanceColor'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CurrencyUtils, GroupMemberPermissions } from 'shared'

function ClaimGhostForm() {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const router = useRouter()
  const { claimCode } = useLocalSearchParams()
  const [error, setError] = useTranslatedError()
  const { data, isLoading, isRefetching, refetch } = useGroupInviteByClaimCode(claimCode as string)
  const { mutateAsync: claimGhost, isPending: isClaiming } = useClaimGhostUser()

  const invite = data?.invite
  const splits = data?.splits ?? []

  const codeIsInvalid = !isLoading && !data

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (invite?.alreadyAMember) {
      setError(t('joinGroup.alreadyAMember'))
    }
  }, [invite?.alreadyAMember, setError, t])

  if (codeIsInvalid) {
    return (
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 64, paddingHorizontal: 12 }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 800 }}>
          {t('claimGhost.invalidCode')}
        </Text>
      </View>
    )
  }

  const header = (
    <View style={{ gap: 12 }}>
      <InvitePane
        invite={invite}
        title={t('claimGhost.header')}
        subtitle={t('claimGhost.youHaveBeenInvited')}
      />
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.colors.surfaceContainer,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 24, color: theme.colors.onSurface, fontWeight: 500 }}>
          {t('claimGhost.balance')}
        </Text>
        <ShimmerPlaceholder
          argument={data}
          style={{ flex: 1, paddingLeft: 32 }}
          shimmerStyle={{ height: 32 }}
        >
          {(data) => (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 30,
                fontWeight: '700',
                color: getBalanceColor(Number(data.balance), theme),
              }}
            >
              {CurrencyUtils.format(data.balance, data.invite.groupInfo.currency, true, true)}
            </Text>
          )}
        </ShimmerPlaceholder>
      </View>
      <FullPaneHeader
        icon='receipt'
        title={t('tabs.splits')}
        textLocation='start'
        adjustsFontSizeToFit
      />
    </View>
  )

  return (
    <View style={[{ flex: 1, paddingHorizontal: isSmallScreen ? 0 : 12 }]}>
      <SplitsList
        info={
          invite
            ? {
                ...invite.groupInfo,
                isAdmin: false,
                hasAccess: false,
                hidden: false,
                balance: '0',
                allowedSplitMethods: [],
                permissions: new GroupMemberPermissions(0, 0, 0),
              }
            : undefined
        }
        splits={splits}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isFetchingNextPage={false}
        hasNextPage={false}
        fetchNextPage={() => {}}
        hideFab
        hideBottomBar
        onRefresh={handleRefresh}
        emptyMessage={t('claimGhost.noSplits')}
        headerComponent={header}
        applyBottomInset={false}
        applyBottomPadding={false}
      />

      <View style={{ paddingHorizontal: 12, gap: 8, marginTop: 4 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <ButtonShimmer argument={invite} offset={0.7}>
          {(invite) =>
            invite.alreadyAMember ? (
              <Button
                title={t('claimGhost.openGroup')}
                rightIcon='chevronForward'
                onPress={() => {
                  router.replace(`/group/${invite.groupInfo.id}`)
                }}
              />
            ) : (
              <Button
                title={t('claimGhost.claim')}
                leftIcon='check'
                isLoading={isClaiming}
                onPress={() => {
                  setError(undefined)
                  claimGhost(claimCode as string)
                    .then(() => {
                      router.replace(`/group/${invite.groupInfo.id}`)
                    })
                    .catch(setError)
                }}
              />
            )
          }
        </ButtonShimmer>
        <Button title={t('cancel')} onPress={() => router.back()} destructive />
      </View>
    </View>
  )
}

export default function ClaimGhostPage() {
  const { user } = useAuth()
  const theme = useTheme()
  const { claimCode } = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      {user && <Header />}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ flex: 1, paddingBottom: insets.bottom || 16 }}>
          {user === undefined && <ActivityIndicator color={theme.colors.primary} />}
          {user === null && <Redirect href={`/?claimCode=${claimCode}`} withAnchor />}
          {user && <ClaimGhostForm />}
        </View>
      </View>
    </View>
  )
}
