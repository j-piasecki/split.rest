import { Button } from '@components/Button'
import Header from '@components/Header'
import { TabView } from '@components/TabView'
import { deleteSplit } from '@database/deleteSplit'
import { getGroupInfo } from '@database/getGroupInfo'
import { getMembers } from '@database/getMembers'
import { getSplits } from '@database/getSplits'
import { setGroupAccess } from '@database/setGroupAccess'
import { setGroupAdmin } from '@database/setGroupAdmin'
import { setGroupHidden } from '@database/setGroupHidden'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo, Member, SplitInfo } from 'shared'

function InfoCard({ info }: { info: GroupInfo | null }) {
  const theme = useTheme()

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 500,
        backgroundColor: theme.colors.surfaceContainer,
        boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
      }}
    >
      {info === null && <ActivityIndicator size='small' />}
      {info !== null && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 30, color: theme.colors.onSurface }}>{info.name}</Text>
            <Text
              style={{
                fontSize: 30,
                color:
                  Number(info.balance) === 0
                    ? theme.colors.outline
                    : Number(info.balance) > 0
                      ? 'green'
                      : 'red',
              }}
            >
              {Number(info.balance) > 0 && '+'}
              {info.balance} <Text style={{ color: 'darkgray' }}>{info.currency}</Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.colors.outline, fontSize: 20 }}>{info?.memberCount}</Text>
              <FontAwesome name='users' size={20} color={theme.colors.outline} />
            </View>

            {!info.hasAccess && <FontAwesome name='lock' size={24} color={theme.colors.outline} />}
            {info.isAdmin && <FontAwesome name='wrench' size={24} color={theme.colors.outline} />}
          </View>
        </>
      )}
    </View>
  )
}

function ActionButtons({ info }: { info: GroupInfo | null }) {
  if (!info) {
    return null
  }

  return (
    <View style={{ marginVertical: 16, flexDirection: 'row', gap: 8 }}>
      <Link href={`/${info.id}/addUser`} asChild>
        <Button title='Add user' />
      </Link>

      <Link href={`/${info.id}/addSplit`} asChild>
        <Button title='Add split' />
      </Link>

      {info.hidden && (
        <Button
          title='Show group'
          onPress={() => {
            setGroupHidden(info.id, false).catch((e) => {
              alert(e.message)
            })
          }}
        />
      )}

      {info.hidden === false && (
        <Button
          title='Hide group'
          onPress={() => {
            setGroupHidden(info.id, true).catch((e) => {
              alert(e.message)
            })
          }}
        />
      )}
    </View>
  )
}

function SplitList({ info }: { info: GroupInfo | null }) {
  const user = useAuth()
  const theme = useTheme()
  const [splits, setSplits] = useState<SplitInfo[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  const loadMore = () => {
    if (user && splits && splits.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getSplits(info.id, splits[splits.length - 1].timestamp).then((newSplits) => {
        setSplits([...splits, ...newSplits])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user?.uid && info?.id && !loadingMoreRef.current) {
      loadingMoreRef.current = true

      getSplits(info?.id)
        .then(setSplits)
        .then(() => {
          loadingMoreRef.current = false
        })
    }
  }, [user?.uid, info?.id, setSplits, counter])

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatList
        contentContainerStyle={{ flex: 1, height: '100%' }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {splits === null && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {splits !== null && splits.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No splits</Text>
            )}
          </View>
        }
        data={splits}
        onEndReachedThreshold={50}
        onEndReached={loadMore}
        renderItem={({ item: split }) => {
          return (
            <View
              key={split.id}
              style={{
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: theme.colors.outlineVariant,
                borderBottomWidth: 1,
              }}
            >
              <View style={{ flex: 2 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
                  {split.title}
                </Text>
              </View>
              <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
                  {split.total} {info?.currency}
                </Text>
              </View>
              <View style={{ flex: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, color: theme.colors.outline }}>
                  {new Date(split.timestamp).toLocaleDateString()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                {(split.paidById === user?.uid || info?.isAdmin) && (
                  <Button
                    title='Delete'
                    onPress={() => {
                      if (info) {
                        deleteSplit(info.id, split.id)
                          .then(forceReload)
                          .catch((e) => {
                            alert(e.message)
                          })
                      }
                    }}
                  />
                )}
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

function MembersList({ info }: { info: GroupInfo | null }) {
  const user = useAuth()
  const theme = useTheme()
  const [members, setMembers] = useState<Member[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  const loadMore = () => {
    if (user && members && members.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getMembers(info.id, members[members.length - 1].id).then((newMembers) => {
        setMembers([...members, ...newMembers])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user?.uid && info?.id) {
      loadingMoreRef.current = true

      getMembers(info?.id)
        .then(setMembers)
        .then(() => {
          loadingMoreRef.current = false
        })
    }
  }, [user?.uid, info?.id, setMembers, counter])

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <FlatList
        contentContainerStyle={{ flex: 1, height: '100%' }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {members === null && <ActivityIndicator size='small' color={theme.colors.onSurface} />}
            {members !== null && members.length === 0 && (
              <Text style={{ fontSize: 20, color: theme.colors.outline }}>No members</Text>
            )}
          </View>
        }
        data={members}
        onEndReachedThreshold={50}
        onEndReached={loadMore}
        renderItem={({ item: member }) => {
          return (
            <View
              key={member.id}
              style={{
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderColor: 'lightgray',
                borderBottomWidth: 1,
              }}
            >
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
                  {member.name}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  gap: 4,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {info.isAdmin && member.id !== user?.uid && member.hasAccess && (
                  <Button
                    title='Revoke access'
                    onPress={() => {
                      setGroupAccess(info.id, member.id, false)
                        .then(forceReload)
                        .catch((e) => {
                          alert(e.message)
                        })
                    }}
                  />
                )}
                {info?.isAdmin && member.id !== user?.uid && !member.hasAccess && (
                  <Button
                    title='Give access'
                    onPress={() => {
                      setGroupAccess(info.id, member.id, true)
                        .then(forceReload)
                        .catch((e) => {
                          alert(e.message)
                        })
                    }}
                  />
                )}

                {info.isAdmin && member.id !== user?.uid && member.isAdmin && (
                  <Button
                    title='Revoke admin'
                    onPress={() => {
                      setGroupAdmin(info.id, member.id, false)
                        .then(forceReload)
                        .catch((e) => {
                          alert(e.message)
                        })
                    }}
                  />
                )}
                {info.isAdmin && member.id !== user?.uid && !member.isAdmin && member.hasAccess && (
                  <Button
                    title='Make admin'
                    onPress={() => {
                      setGroupAdmin(info.id, member.id, true)
                        .then(forceReload)
                        .catch((e) => {
                          alert(e.message)
                        })
                    }}
                  />
                )}
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'flex-end', minWidth: 100 }}>
                <Text
                  style={{
                    fontSize: 20,
                    color:
                      Number(member.balance) === 0
                        ? theme.colors.outline
                        : Number(member.balance) > 0
                          ? 'green'
                          : 'red',
                  }}
                >
                  {Number(member.balance) > 0 && '+'}
                  {member.balance}
                </Text>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

function ContentSwitcher({ info }: { info: GroupInfo | null }) {
  const theme = useTheme()

  return (
    <TabView
      openedTab={0}
      tabs={[
        {
          header: () => <FontAwesome name='list-ul' size={20} color={theme.colors.outline} />,
          content: () => <SplitList info={info} />,
        },
        {
          header: () => <FontAwesome name='users' size={20} color={theme.colors.outline} />,
          content: () => <MembersList info={info} />,
        },
      ]}
    />
  )
}

export default function GroupScreen() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)

  useEffect(() => {
    if (user) {
      getGroupInfo(groupId).then(setGroupInfo)
    }
  }, [user, setGroupInfo, groupId])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <InfoCard info={groupInfo} />
          <ActionButtons info={groupInfo} />
        </View>
        <View style={{ width: '100%', maxWidth: 768, flex: 1 }}>
          <ContentSwitcher info={groupInfo} />
        </View>
      </View>
    </View>
  )
}
