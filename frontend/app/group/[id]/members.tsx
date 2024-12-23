import Header from '@components/Header'
import { PaneHeader } from '@components/Pane'
import { Text } from '@components/Text'
import { MembersList } from '@components/groupScreen/MembersList'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { styles } from '@styling/styles'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

function ListHeader({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const { t } = useTranslation()
  return (
    <View
      style={[
        {
          marginTop: 16,
          backgroundColor: theme.colors.surfaceContainer,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        styles.paneShadow,
      ]}
    >
      <PaneHeader
        icon='members'
        title={t('tabs.members')}
        showSeparator={false}
        textLocation='start'
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

      <View style={{ flex: 1, alignItems: 'center' }}>
        <MembersList
          applyBottomInset
          info={groupInfo}
          headerComponent={ListHeader}
          footerComponent={
            <View
              style={[
                {
                  height: 16,
                  backgroundColor: theme.colors.surfaceContainer,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                },
                styles.paneShadow,
              ]}
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
