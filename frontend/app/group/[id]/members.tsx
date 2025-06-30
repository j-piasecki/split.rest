import Header from '@components/Header'
import { PaneHeader } from '@components/Pane'
import { Text } from '@components/Text'
import { MembersList } from '@components/groupScreen/MembersList'
import { MembersOrderFilter } from '@components/groupScreen/MembersOrderFilter'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

function ListHeader({
  children,
  onChange,
  lowToHigh,
}: {
  children?: React.ReactNode
  onChange: (lowToHigh: boolean | undefined) => void
  lowToHigh: boolean | undefined
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceContainer,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          marginBottom: 2,
        },
      ]}
    >
      <PaneHeader
        icon='members'
        title={t('tabs.members')}
        textLocation='start'
        rightComponent={
          // @ts-expect-error flex cannot really be null, but this way it can be overriden
          <MembersOrderFilter style={{ flex: null }} onChange={onChange} lowToHigh={lowToHigh} />
        }
      />
      {children}
    </View>
  )
}

export function GroupMembersScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)
  const { data: groupInfo, error } = useGroupInfo(groupId)
  const [membersLowToHigh, setMembersLowToHigh] = useState<boolean | undefined>(true)

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Header showBackButton />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 32 }}>{':('}</Text>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
            {t('groupInfo.couldNotLoad')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <MembersList
        showPullableHeader
        applyBottomInset
        info={groupInfo}
        lowToHigh={membersLowToHigh}
        horizontalPadding={12}
        headerComponent={<ListHeader onChange={setMembersLowToHigh} lowToHigh={membersLowToHigh} />}
      />
    </View>
  )
}

export default function MembersScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return <GroupMembersScreen />
}
