import Header from '@components/Header'
import { Icon } from '@components/Icon'
import { Text } from '@components/Text'
import { MembersList } from '@components/groupScreen/MembersList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ListHeader({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const { t } = useTranslation()
  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: theme.colors.surfaceContainer,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name='members' size={24} color={theme.colors.secondary} />
        <Text style={{ color: theme.colors.secondary, fontSize: 20, fontWeight: 600 }}>
          {t('tabs.members')}
        </Text>
      </View>
      {children}
    </View>
  )
}

export function GroupMembersScreen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)
  const { data: groupInfo, error } = useGroupInfo(groupId)

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Header />
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
      <Header />

      <View style={{ flex: 1, alignItems: 'center', paddingBottom: insets.bottom }}>
        <MembersList
          info={groupInfo}
          headerComponent={ListHeader}
          footerComponent={
            <View
              style={{
                height: 16,
                backgroundColor: theme.colors.surfaceContainer,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
            />
          }
        />
      </View>
    </View>
  )
}

export default function GroupScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return <GroupMembersScreen />
}
