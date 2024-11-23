import { getAllUserGroupsInfo } from '@database/getAllUserGroupsInfo'
import { getAllUserGroupsMetadata } from '@database/getAllUserGroupsMetadata'
import { GroupInfo } from '@type/group'
import { logout, useAuth } from '@utils/auth'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'

function GroupList() {
  const [groups, setGroups] = useState<GroupInfo[] | null>(null)

  useEffect(() => {
    getAllUserGroupsMetadata().then(getAllUserGroupsInfo).then(setGroups)
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {groups === null && <Text>Loading...</Text>}
      <Text style={{ fontSize: 20 }}>Groups:</Text>
      {groups && groups.filter(g => !g.hidden).map((group) => (
        <Link key={group.id} href={`/${group.id}`} asChild>
          <Text style={{ fontSize: 20 }}>{group.name} <Text style={{opacity: 0.5}}>({group.currency}), members: {group.memberCount}</Text></Text>
        </Link>
      ))}

      <Text style={{ fontSize: 20 }}>Hidden groups:</Text>
      {groups && groups.filter(g => g.hidden).map((group) => (
        <Link key={group.id} href={`/${group.id}`} asChild>
          <Text style={{ fontSize: 20 }}>{group.name} <Text style={{opacity: 0.5}}>({group.currency}), members: {group.memberCount}</Text></Text>
        </Link>
      ))}
    </View>
  )
}

export default function Home() {
  const user = useAuth()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title='Logout' onPress={logout} />

      <Link href='/createGroup' asChild>
        <Button title='Create Group' />
      </Link>

      {user && <GroupList /> }
    </View>
  )
}
