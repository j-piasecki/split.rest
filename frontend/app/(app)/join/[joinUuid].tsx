import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { ErrorText } from '@components/ErrorText'
import Header from '@components/Header'
import { InvitePane } from '@components/InvitePane'
import { Text } from '@components/Text'
import { useGroupInviteByLink } from '@hooks/database/useGroupInviteByLink'
import { useJoinGroupByLink } from '@hooks/database/useJoinGroupByLink'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInviteWithGroupInfoAndMemberIds } from 'shared'

interface JoinInvitePaneProps {
  invite?: GroupInviteWithGroupInfoAndMemberIds
  uuid: string
}

function JoinInvitePane({ invite, uuid }: JoinInvitePaneProps) {
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const router = useRouter()
  const { mutateAsync: joinGroup, isPending: isJoiningGroup } = useJoinGroupByLink()
  const [error, setError] = useTranslatedError()

  useEffect(() => {
    if (invite?.alreadyAMember) {
      setError(t('joinGroup.alreadyAMember'))
    }
  }, [invite?.alreadyAMember, setError, t])

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 500,
        justifyContent: isSmallScreen ? 'space-between' : undefined,
      }}
    >
      <View>
        <InvitePane
          invite={invite}
          title={t('joinGroup.header')}
          subtitle={t('joinGroup.youveBeenInvitedToJoin')}
        />
      </View>

      <View style={{ flexDirection: 'column', paddingTop: 24, gap: 8 }}>
        <ErrorText>{error ?? ' '}</ErrorText>
        <ButtonShimmer argument={invite} offset={0.7}>
          {(invite) =>
            invite.alreadyAMember ? (
              <Button
                title={t('joinGroup.openGroup')}
                rightIcon='chevronForward'
                onPress={() => {
                  router.replace(`/group/${invite.groupInfo.id}`)
                }}
              />
            ) : (
              <Button
                title={t('joinGroup.join')}
                isLoading={isJoiningGroup}
                leftIcon='check'
                onPress={() => {
                  setError(undefined)
                  joinGroup(uuid as string)
                    .then(() => {
                      router.replace(`/group/${invite.groupInfo.id}`)
                    })
                    .catch(setError)
                }}
              />
            )
          }
        </ButtonShimmer>
      </View>
    </View>
  )
}

function JoinForm() {
  const theme = useTheme()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const { joinUuid } = useLocalSearchParams()
  const { data: invite, isLoading: isLoadingInvite } = useGroupInviteByLink(joinUuid as string)

  const groupDoesntExist = !isLoadingInvite && !invite

  return (
    <View
      style={[
        { flex: 1, paddingHorizontal: 12 },
        (!isSmallScreen || groupDoesntExist) && { alignItems: 'center', paddingTop: 64 },
      ]}
    >
      {!groupDoesntExist && <JoinInvitePane invite={invite} uuid={joinUuid as string} />}
      {groupDoesntExist && (
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 800 }}>
          {t('joinGroup.noGroupFoundForThisJoinLink')}
        </Text>
      )}
    </View>
  )
}

export default function JoinPage() {
  const { user } = useAuth()
  const theme = useTheme()
  const { joinUuid } = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      {user && <Header showBackButton />}
      <View style={{ flex: 1, paddingBottom: insets.bottom || 16 }}>
        {user === undefined && <ActivityIndicator color={theme.colors.primary} />}
        {user === null && <Redirect href={`/?joinUuid=${joinUuid}`} withAnchor />}
        {user && <JoinForm />}
      </View>
    </View>
  )
}
