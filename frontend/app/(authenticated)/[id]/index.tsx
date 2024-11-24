import { deleteSplit } from '@database/deleteSplit'
import { getEntries } from '@database/getEntries'
import { getGroupBalance } from '@database/getGroupBalance'
import { getGroupInfo } from '@database/getGroupInfo'
import { getMembers } from '@database/getMembers'
import { setGroupAccess } from '@database/setGroupAccess'
import { setGroupAdmin } from '@database/setGroupAdmin'
import { setGroupHidden } from '@database/setGroupHidden'
import { useAuth } from '@utils/auth'
import { Link, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useReducer, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { Split, GroupInfo, Member } from 'shared'

export default function Group() {
  const user = useAuth()
  const navigation = useNavigation()
  const { id } = useLocalSearchParams()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [entries, setEntries] = useState<Split[] | null>(null)

  const [counter, reloadData] = useReducer((count) => count + 1, 0)

  const groupId = typeof id === 'string' ? id : id[0]

  useEffect(() => {
    getGroupInfo(groupId).then(setGroupInfo)
    getGroupBalance(groupId).then(setBalance)
    getMembers(groupId).then(setMembers)
    getEntries(groupId).then(setEntries)
  }, [groupId, counter])

  useFocusEffect(() => {
    navigation.setOptions({ title: `Group ${groupInfo?.name}` })
  })

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20 }}>
        Split {groupInfo?.name} balance: {balance} {groupInfo?.currency}
      </Text>

      <Link href={`/${groupInfo?.id}/addUser`} asChild>
        <Button title='Add user' />
      </Link>

      <Link href={`/${groupInfo?.id}/addSplit`} asChild>
        <Button title='Add split' />
      </Link>

      {groupInfo?.hidden && (
        <Button
          title='Show group'
          onPress={() => {
            setGroupHidden(groupId, false)
              .then(reloadData)
              .catch((e) => {
                alert(e.message)
              })
          }}
        />
      )}

      {groupInfo?.hidden === false && (
        <Button
          title='Hide group'
          onPress={() => {
            setGroupHidden(groupId, true)
              .then(reloadData)
              .catch((e) => {
                alert(e.message)
              })
          }}
        />
      )}

      <Text style={{ fontSize: 20 }}>10 Members:</Text>
      {members &&
        members.map((member) => {
          return (
            <View
              key={member.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: 'gray',
                borderBottomWidth: 1,
                padding: 8,
              }}
            >
              <Text>{member.name}</Text>
              <Text>{member.email}</Text>
              <Text>
                {member.balance} {groupInfo?.currency}
              </Text>

              {groupInfo?.isAdmin && member.id !== user?.uid && member.hasAccess && (
                <Button
                  title='Revoke access'
                  onPress={() => {
                    setGroupAccess(groupId, member.id, false)
                      .then(reloadData)
                      .catch((e) => {
                        alert(e.message)
                      })
                  }}
                />
              )}
              {groupInfo?.isAdmin && member.id !== user?.uid && !member.hasAccess && (
                <Button
                  title='Give access'
                  onPress={() => {
                    setGroupAccess(groupId, member.id, true)
                      .then(reloadData)
                      .catch((e) => {
                        alert(e.message)
                      })
                  }}
                />
              )}

              {groupInfo?.isAdmin && member.id !== user?.uid && member.isAdmin && (
                <Button
                  title='Revoke admin'
                  onPress={() => {
                    setGroupAdmin(groupId, member.id, false)
                      .then(reloadData)
                      .catch((e) => {
                        alert(e.message)
                      })
                  }}
                />
              )}
              {groupInfo?.isAdmin &&
                member.id !== user?.uid &&
                !member.isAdmin &&
                member.hasAccess && (
                  <Button
                    title='Make admin'
                    onPress={() => {
                      setGroupAdmin(groupId, member.id, true)
                        .then(reloadData)
                        .catch((e) => {
                          alert(e.message)
                        })
                    }}
                  />
                )}
            </View>
          )
        })}

      <Text style={{ fontSize: 20 }}>10 Entries:</Text>
      {entries &&
        entries.map((entry) => {
          return (
            <View
              key={entry.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: 'gray',
                borderBottomWidth: 1,
                padding: 8,
              }}
            >
              <Text>{entry.title}</Text>
              <Text>{new Date(entry.timestamp).toISOString()}</Text>
              <Text>
                {entry.total} {groupInfo?.currency}
              </Text>
              {(entry.paidById === user?.uid || groupInfo?.isAdmin) && (
                <Button
                  title='Delete'
                  onPress={() => {
                    deleteSplit(groupId, entry.id)
                      .then(reloadData)
                      .catch((e) => {
                        alert(e.message)
                      })
                  }}
                />
              )}
            </View>
          )
        })}
    </View>
  )
}
