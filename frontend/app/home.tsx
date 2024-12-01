import { Button } from '@components/Button'
import Header from '@components/Header'
import { getAllUserGroups } from '@database/getAllUserGroups'
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function Group({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const offColor = 'darkgray'

  return (
    <Link key={info.id} href={`/${info.id}`} asChild>
      <View
        style={{
          flex: 1,
          padding: 16,
          borderRadius: 16,
          marginVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'visible',
          backgroundColor: theme.colors.surfaceContainer,
        }}
      >
        <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>{info.name}</Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text style={{ fontSize: 16, color: offColor }}>{info.memberCount}</Text>
            <FontAwesome
              name='users'
              size={16}
              color={offColor}
              style={{ transform: [{ translateY: 2 }] }}
            />
          </View>

          <FontAwesome
            name='lock'
            size={16}
            color={info.hasAccess ? 'transparent' : offColor}
            style={{ transform: [{ translateY: 2 }] }}
          />
          <FontAwesome
            name='wrench'
            size={16}
            color={info.isAdmin ? offColor : 'transparent'}
            style={{ transform: [{ translateY: 2 }] }}
          />

          <Text style={{ fontSize: 16, color: offColor }}>{info.currency}</Text>
        </View>
      </View>
    </Link>
  )
}

function GroupList({ groups }: { groups: GroupInfo[] }) {
  return (
    <View style={{ marginTop: 8 }}>
      {groups.map((group) => (
        <Group info={group} key={group.id} />
      ))}
    </View>
  )
}

function HiddenGroupsButton({
  showHidden,
  setShowHidden,
}: {
  showHidden: boolean
  setShowHidden: (val: boolean) => void
}) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={() => {
        setShowHidden(!showHidden)
      }}
      style={({ pressed }) => {
        return {
          opacity: pressed ? 0.4 : 0.5,
        }
      }}
    >
      <View style={{ flex: 1, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: theme.colors.onSurfaceVariant }} />
        <Text
          style={{ marginHorizontal: 8, fontSize: 16, color: theme.colors.onSurfaceVariant }}
          selectable={false}
        >
          {showHidden ? 'Hide hidden groups' : 'Show hidden groups'}
        </Text>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: theme.colors.onSurfaceVariant }} />
      </View>
    </Pressable>
  )
}

export default function Home() {
  const user = useAuth()
  const theme = useTheme()
  const [groups, setGroups] = useState<GroupInfo[] | null>(null)
  const [hiddenGroups, setHiddenGroups] = useState<GroupInfo[] | null>(null)

  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    if (user) {
      // TODO: pagination
      getAllUserGroups(false).then(setGroups)
      getAllUserGroups(true).then(setHiddenGroups)
    }
  }, [user, setGroups, setHiddenGroups])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surfaceDim }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 768 }}>
          {groups && hiddenGroups && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 32 }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 28, color: theme.colors.onSurface }}>Groups</Text>
                <Link href='/createGroup' asChild>
                  <Button
                    title='Create group'
                    icon={<Entypo name='plus' size={20} color={theme.colors.onPrimaryContainer} />}
                  />
                </Link>
              </View>
              <GroupList groups={groups} />

              {Boolean(hiddenGroups?.length) && (
                <HiddenGroupsButton showHidden={showHidden} setShowHidden={setShowHidden} />
              )}
              {showHidden && (
                <>
                  <Text style={{ fontSize: 28, color: theme.colors.onSurface }}>Hidden groups</Text>
                  <GroupList groups={hiddenGroups} />
                </>
              )}
            </ScrollView>
          )}

          {(!groups || !hiddenGroups) && (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size='small' color={theme.colors.onSurface} />
              <Text style={{ textAlign: 'center', color: theme.colors.onSurface }}>
                Loading splits
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
