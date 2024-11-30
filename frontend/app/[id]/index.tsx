import { Button } from '@components/Button'
import Header from '@components/Header'
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
import { isCloseToBottom } from '@utils/isScrollViewCloseToBottom'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
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
                  Number(info.balance) === 0 ? 'gray' : Number(info.balance) > 0 ? 'green' : 'red',
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
              <Text style={{ color: 'gray', fontSize: 20 }}>{info?.memberCount}</Text>
              <FontAwesome name='users' size={20} color={'gray'} />
            </View>

            {!info.hasAccess && <FontAwesome name='lock' size={24} color={'gray'} />}
            {info.isAdmin && <FontAwesome name='wrench' size={24} color={'gray'} />}
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

function SplitList({
  info,
  scrollEndHandler,
}: {
  info: GroupInfo | null
  scrollEndHandler: React.MutableRefObject<() => void>
}) {
  const user = useAuth()
  const theme = useTheme()
  const [splits, setSplits] = useState<SplitInfo[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  scrollEndHandler.current = () => {
    if (user && splits && splits.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getSplits(info.id, splits[splits.length - 1].timestamp).then((newSplits) => {
        setSplits([...splits, ...newSplits])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user && info?.id) {
      getSplits(info?.id).then(setSplits)
    }
  }, [user, info?.id, setSplits, counter])

  return (
    <View style={{ width: '100%' }}>
      {!splits && <ActivityIndicator size='small' style={{ padding: 32 }} />}
      {splits &&
        splits.map((split) => {
          return (
            <View
              key={split.id}
              style={{
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: 'lightgray',
                borderBottomWidth: 1,
              }}
            >
              <View style={{ flex: 2 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
                  {split.title}
                </Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
                  {split.total} {info?.currency}
                </Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={{ fontSize: 20, color: 'gray' }}>
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
        })}
    </View>
  )
}

function MembersList({
  info,
  scrollEndHandler,
}: {
  info: GroupInfo | null
  scrollEndHandler: React.MutableRefObject<() => void>
}) {
  const user = useAuth()
  const theme = useTheme()
  const [members, setMembers] = useState<Member[] | null>(null)
  const loadingMoreRef = useRef(false)

  const [counter, forceReload] = useReducer((x) => x + 1, 0)

  scrollEndHandler.current = () => {
    if (user && members && members.length > 0 && !loadingMoreRef.current && info) {
      loadingMoreRef.current = true

      getMembers(info.id, members[members.length - 1].id).then((newMembers) => {
        setMembers([...members, ...newMembers])
        loadingMoreRef.current = false
      })
    }
  }

  useEffect(() => {
    if (user && info?.id) {
      getMembers(info?.id).then(setMembers)
    }
  }, [user, info?.id, setMembers, counter])

  if (!info) {
    return null
  }

  return (
    <View style={{ width: '100%' }}>
      {!members && <ActivityIndicator size='small' style={{ padding: 32 }} />}
      {members &&
        members.map((member) => {
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
                        ? 'gray'
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
        })}
    </View>
  )
}

function ContentSwitcher({
  info,
  scrollEndHandler,
}: {
  info: GroupInfo | null
  scrollEndHandler: React.MutableRefObject<() => void>
}) {
  const theme = useTheme()
  const [listSelected, setListSelected] = useState(true)

  return (
    <View style={{ width: '100%' }}>
      <View style={{ width: '100%', height: 40, flexDirection: 'row' }}>
        <Pressable
          style={({ pressed }) => {
            return {
              backgroundColor: pressed
                ? theme.colors.surfaceContainer
                : listSelected
                  ? theme.colors.surfaceContainerLow
                  : theme.colors.transparent,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }
          }}
          onPress={() => {
            setListSelected(true)
          }}
        >
          <FontAwesome name='list-ul' size={20} color='gray' />
        </Pressable>

        <Pressable
          style={({ pressed }) => {
            return {
              backgroundColor: pressed
                ? theme.colors.surfaceContainer
                : !listSelected
                  ? theme.colors.surfaceContainerLow
                  : theme.colors.transparent,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }
          }}
          onPress={() => {
            setListSelected(false)
          }}
        >
          <FontAwesome name='users' size={20} color='gray' />
        </Pressable>
      </View>

      {listSelected && <SplitList info={info} scrollEndHandler={scrollEndHandler} />}
      {!listSelected && <MembersList info={info} scrollEndHandler={scrollEndHandler} />}
    </View>
  )
}

export default function GroupScreen() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const groupId = Number(id as string)

  const scrollViewInfo = useRef({
    contentSize: { width: 0, height: 0 },
    layout: { x: 0, y: 0, width: 0, height: 0 },
    contentOffset: { x: 0, y: 0 },
  })

  const scrollEndHandler = useRef(() => {})

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)

  useEffect(() => {
    if (user) {
      getGroupInfo(groupId).then(setGroupInfo)
    }
  }, [user, setGroupInfo, groupId])

  function onScrollUpdate() {
    if (isCloseToBottom(scrollViewInfo.current)) {
      scrollEndHandler.current()
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <ScrollView
          style={{ flex: 1, width: '100%', maxWidth: 768 }}
          contentContainerStyle={{
            alignItems: 'center',
            paddingVertical: 24,
            paddingHorizontal: 32,
          }}
          scrollEventThrottle={500}
          onScroll={(e) => {
            scrollViewInfo.current.contentOffset = e.nativeEvent.contentOffset
            onScrollUpdate()
          }}
          onContentSizeChange={(w, h) => {
            scrollViewInfo.current.contentSize = { width: w, height: h }
            onScrollUpdate()
          }}
          onLayout={(e) => {
            scrollViewInfo.current.layout = e.nativeEvent.layout
            onScrollUpdate()
          }}
        >
          <InfoCard info={groupInfo} />
          <ActionButtons info={groupInfo} />
          <ContentSwitcher info={groupInfo} scrollEndHandler={scrollEndHandler} />
        </ScrollView>
      </View>
    </View>
  )
}
