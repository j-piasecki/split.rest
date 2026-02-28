import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { ErrorText } from '@components/ErrorText'
import { GroupIcon } from '@components/GroupIcon'
import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { MemberBubbles } from '@components/MemberBubbles'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupInviteByLink } from '@hooks/database/useGroupInviteByLink'
import { useJoinGroupByLink } from '@hooks/database/useJoinGroupByLink'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import i18n from '@utils/i18n'
import { measure } from '@utils/measure'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInviteWithGroupInfoAndMemberIds } from 'shared'

interface InvitePaneProps {
  invite?: GroupInviteWithGroupInfoAndMemberIds
  uuid: string
}

function InvitePane({ invite, uuid }: InvitePaneProps) {
  const theme = useTheme()
  const router = useRouter()
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { t } = useTranslation()
  const { mutateAsync: joinGroup, isPending: isJoiningGroup } = useJoinGroupByLink()
  const [error, setError] = useTranslatedError()
  const bubblesContainerRef = useRef<View>(null)
  const [bubblesContainerWidth, setBubblesContainerWidth] = useState(0)

  useLayoutEffect(() => {
    if (bubblesContainerRef.current) {
      setBubblesContainerWidth(measure(bubblesContainerRef.current).width)
    }
  }, [bubblesContainerRef])

  useEffect(() => {
    if (invite?.alreadyAMember) {
      setError(t('joinGroup.alreadyAMember'))
    }
  }, [invite?.alreadyAMember, setError, t])

  const currencyKey = invite?.groupInfo.currency?.toLocaleLowerCase()
  const currencyText = i18n.exists(`currency.${currencyKey}`)
    ? // @ts-expect-error Handled by the condition above
      t(`currency.${currencyKey}`)
    : currencyKey

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
        <Pane
          icon='stackedEmail'
          textLocation='start'
          title={t('joinGroup.header')}
          containerStyle={{ padding: 16, paddingTop: 8, gap: 8 }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 18, fontWeight: 600 }}>
            {t('joinGroup.youveBeenInvitedToJoin')}
          </Text>

          <ShimmerPlaceholder argument={invite} shimmerStyle={{ height: 40 }}>
            {(invite) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GroupIcon info={invite.groupInfo} size={40} />
                <Text
                  numberOfLines={3}
                  style={{
                    flex: 1,
                    color: theme.colors.onSurface,
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {invite.groupInfo.name}
                </Text>
              </View>
            )}
          </ShimmerPlaceholder>

          <ShimmerPlaceholder
            argument={invite}
            shimmerStyle={{ height: 25, width: '70%' }}
            offset={0.9}
          >
            {(_invite) => (
              <View style={{ flexDirection: 'row' }}>
                <Icon
                  name='currency'
                  size={24}
                  color={theme.colors.outline}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: theme.colors.onSurface, fontSize: 18, width: '70%' }}>
                  {t('joinGroup.currency', { currency: currencyText })}
                </Text>
              </View>
            )}
          </ShimmerPlaceholder>

          <ShimmerPlaceholder
            argument={invite}
            shimmerStyle={{ height: 25, width: '70%' }}
            offset={0.85}
          >
            {(invite) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name='user'
                  size={24}
                  color={theme.colors.outline}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: theme.colors.onSurface, fontSize: 18, marginRight: 8 }}>
                  <Trans
                    i18nKey='joinGroup.invitedBy'
                    values={{ name: invite.createdBy.name }}
                    components={{
                      Styled: <Text style={{ color: theme.colors.primary, fontWeight: 600 }} />,
                    }}
                  />
                </Text>
                <ProfilePicture user={invite.createdBy} size={24} />
              </View>
            )}
          </ShimmerPlaceholder>

          <View ref={bubblesContainerRef} style={{ marginTop: 8, marginBottom: 8 }}>
            <ShimmerPlaceholder
              argument={invite}
              shimmerStyle={{ width: bubblesContainerWidth, height: 140 }}
            >
              {(invite) => (
                <MemberBubbles
                  middleIconSize={52}
                  profilePictures={invite.profilePictures}
                  width={bubblesContainerWidth}
                  height={140}
                  info={invite.groupInfo}
                />
              )}
            </ShimmerPlaceholder>
          </View>
        </Pane>
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
  const { uuid } = useLocalSearchParams()
  const { data: invite, isLoading: isLoadingInvite } = useGroupInviteByLink(uuid as string)

  const groupDoesntExist = !isLoadingInvite && !invite

  return (
    <View
      style={[
        { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
        (!isSmallScreen || groupDoesntExist) && { alignItems: 'center', paddingTop: 64 },
      ]}
    >
      {!groupDoesntExist && <InvitePane invite={invite} uuid={uuid as string} />}
      {groupDoesntExist && (
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: 800 }}>
          {t('joinGroup.noGroupFoundForThisJoinLink')}
        </Text>
      )}
    </View>
  )
}

export default function JoinPage() {
  const { user } = useAuth(false)
  const theme = useTheme()
  const { uuid } = useLocalSearchParams()
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
        {user === null && <Redirect href={`/login?join=${uuid}`} withAnchor />}
        {user && <JoinForm />}
      </View>
    </View>
  )
}
