import { EditableText } from '@components/EditableText'
import ModalScreen from '@components/ModalScreen'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSetUserDisplayNameMutation } from '@hooks/database/useSetUserDisplayName'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { isTranslatableError } from 'shared'

export function MemberScreen() {
  const user = useAuth()
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()
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
                placeholder='placeholder'
                isPending={isChangingDisplayName}
                disabled={!canEditDisplayName}
                onSubmit={(name) =>
                  setDisplayName(name).catch((e) => {
                    if (isTranslatableError(e)) {
                      alert(t(e.message))
                    }
                  })
                }
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
