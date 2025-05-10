import { Button } from '@components/Button'
import { EditableText } from '@components/EditableText'
import { Icon } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetUserDisplayNameMutation } from '@hooks/database/useSetUserDisplayName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { isTranslatableError } from 'shared'

export function MemberScreen() {
  const user = useAuth()
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const router = useRouter()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(groupId))
  const { data: userPermissions } = useGroupPermissions(Number(groupId))
  const { data: memberInfo, error } = useGroupMemberInfo(Number(groupId), String(memberId))

  const { mutateAsync: setDisplayName, isPending: isChangingDisplayName } =
    useSetUserDisplayNameMutation(Number(groupId), String(memberId))

  const canEditDisplayName =
    userPermissions?.canChangeEveryoneDisplayName() ||
    (userPermissions?.canChangeDisplayName() && user?.id === memberId)

  if (error || userPermissions?.canReadMembers() === false) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          {userPermissions?.canReadMembers() ? (
            <>
              <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
              <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
                {t('api.group.userNotInGroup')}
              </Text>
            </>
          ) : (
            <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
              {t('api.insufficientPermissions.group.readMembers')}
            </Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingBottom: insets.bottom,
          alignItems: 'center',
          gap: 24,
        }}
      >
        <ShimmerPlaceholder
          argument={memberInfo}
          style={{ width: 96, height: 96 }}
          shimmerStyle={{ borderRadius: 48 }}
        >
          {(memberInfo) => <ProfilePicture userId={memberInfo.id} size={96} />}
        </ShimmerPlaceholder>
        <View style={{ alignItems: 'center', gap: 8, width: '100%' }}>
          <ShimmerPlaceholder
            argument={memberInfo}
            style={{ width: '100%', alignItems: 'center' }}
            shimmerStyle={{ width: 200, height: 32 }}
          >
            {(memberInfo) => (
              <EditableText
                value={memberInfo.displayName ?? memberInfo.name}
                placeholder={t('memberInfo.displayNamePlaceholder')}
                isPending={isChangingDisplayName}
                disabled={!canEditDisplayName}
                onSubmit={(name) => {
                  let newName: string | null = name.trim()
                  if (newName === memberInfo.name) {
                    newName = null
                  }
                  setDisplayName(newName).catch((e) => {
                    if (isTranslatableError(e)) {
                      alert(t(e.message, e.args))
                    }
                  })
                }}
                style={{ alignSelf: 'stretch', justifyContent: 'center' }}
                textStyle={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  textAlign: 'center',
                }}
              />
            )}
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 22 }}>
            {(memberInfo) =>
              memberInfo.displayName && (
                <Text
                  style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}
                >
                  {memberInfo.name}
                </Text>
              )
            }
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 22 }}>
            {(memberInfo) => (
              <Text
                style={{ fontSize: 16, fontWeight: '400', color: theme.colors.onSurfaceVariant }}
              >
                {memberInfo.email}
              </Text>
            )}
          </ShimmerPlaceholder>
          <ShimmerPlaceholder argument={memberInfo} shimmerStyle={{ width: 240, height: 28 }}>
            {(memberInfo) => (
              <Text style={{ fontSize: 22, fontWeight: '500', color: theme.colors.onSurface }}>
                <Trans
                  values={{ balance: memberInfo.balance }}
                  i18nKey={'memberInfo.balance'}
                  components={{
                    Styled: (
                      <Text
                        style={{
                          fontWeight: '600',
                          color: getBalanceColor(Number(memberInfo.balance), theme),
                        }}
                      />
                    ),
                  }}
                />
              </Text>
            )}
          </ShimmerPlaceholder>

          {memberInfo && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 16,
              }}
            >
              {!memberInfo.hasAccess ? (
                <>
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Icon name={'lock'} size={20} color={theme.colors.error} />
                  </View>
                  <Text
                    style={{
                      color: theme.colors.error,
                      fontSize: 18,
                    }}
                  >
                    {t('memberInfo.noAccess')}
                  </Text>
                </>
              ) : memberInfo.isAdmin ? (
                <>
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Icon name='shield' size={20} color={theme.colors.onSurface} />
                  </View>
                  <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
                    {t('memberInfo.admin')}
                  </Text>
                </>
              ) : null}
            </View>
          )}

          {userPermissions?.canSettleUp() &&
            memberId !== user?.id &&
            Number(groupInfo?.balance) !== 0 && (
              <View style={{ width: '100%' }}>
                <Button
                  leftIcon='balance'
                  title={t('memberInfo.settleUpWithMember')}
                  onPress={() => {
                    router.navigate(`/group/${groupId}/settleUp?withMembers=${memberId}`)
                  }}
                />
              </View>
            )}
        </View>
      </View>
    </View>
  )
}

export default function MemberInfoScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.memberInfo')}
      maxWidth={500}
      maxHeight={400}
    >
      <MemberScreen />
    </ModalScreen>
  )
}
