import Header from '@components/Header'
import { getAllUserGroupsInfo } from '@database/getAllUserGroupsInfo'
import { getAllUserGroupsMetadata } from '@database/getAllUserGroupsMetadata'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useAuth } from '@utils/auth'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Button, Pressable, ScrollView, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function Group({ info }: { info: GroupInfo }) {
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
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Text style={{ fontSize: 20 }}>{info.name}</Text>

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
  return (
    <Pressable
      onPress={() => {
        setShowHidden(!showHidden)
      }}
      style={({ pressed }) => {
        return {
          opacity: pressed ? 0.3 : 0.5,
        }
      }}
    >
      <View style={{ flex: 1, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: 'black' }} />
        <Text style={{ marginHorizontal: 8, fontSize: 16 }} selectable={false}>
          {showHidden ? 'Hide hidden groups' : 'Show hidden groups'}
        </Text>
        <View style={{ borderTopWidth: 1, flex: 1, borderColor: 'black' }} />
      </View>
    </Pressable>
  )
}

export default function Home() {
  const user = useAuth()
  const [groups, setGroups] = useState<GroupInfo[] | null>(null)
  const [hiddenGroups, setHiddenGroups] = useState<GroupInfo[] | null>(null)

  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    if (user) {
      getAllUserGroupsMetadata()
        .then(getAllUserGroupsInfo)
        .then((groups) => {
          setGroups(groups.filter((g) => !g.hidden))
          setHiddenGroups(groups.filter((g) => g.hidden))
        })
    }
  }, [user, setGroups, setHiddenGroups])

  return (
    <View style={{ flex: 1 }}>
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
                <Text style={{ fontSize: 28 }}>Groups</Text>
                <Link href='/createGroup' asChild>
                  <Button title='Create group' />
                </Link>
              </View>
              <GroupList groups={groups} />

              {Boolean(hiddenGroups?.length) && (
                <HiddenGroupsButton showHidden={showHidden} setShowHidden={setShowHidden} />
              )}
              {showHidden && (
                <>
                  <Text style={{ fontSize: 28 }}>Hidden groups</Text>
                  <GroupList groups={hiddenGroups} />
                </>
              )}
            </ScrollView>
          )}

          {(!groups || !hiddenGroups) && (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size='small' />
              <Text style={{ textAlign: 'center' }}>Loading splits</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
