import { FloatingActionButton, FloatingActionButtonRef } from '@components/FloatingActionButton'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GroupInfo } from 'shared'

export interface InviteMemberFabProps {
  info?: GroupInfo
  iconOnly?: boolean
  applyBottomInset?: boolean
  threeBarLayout?: boolean
  fabRef?: React.RefObject<FloatingActionButtonRef | null>
}

export function InviteMemberFab({
  info,
  iconOnly,
  applyBottomInset,
  threeBarLayout,
  fabRef,
}: InviteMemberFabProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: permissions } = useGroupPermissions(info?.id)

  return (
    permissions?.canInviteMembers() && (
      <View
        style={{
          position: 'absolute',
          bottom: (threeBarLayout ? 8 : 16) + (applyBottomInset ? insets.bottom : 0),
          right: threeBarLayout ? 8 : 16,
        }}
      >
        <FloatingActionButton
          ref={fabRef}
          icon='addMember'
          title={iconOnly ? '' : t('inviteMember.inviteMember')}
          onPress={() => {
            router.navigate(`/group/${info?.id}/inviteMember`)
          }}
        />
      </View>
    )
  )
}
