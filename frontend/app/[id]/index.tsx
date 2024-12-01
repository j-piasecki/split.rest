import { Button } from '@components/Button'
import Header from '@components/Header'
import { Tab, TabView } from '@components/TabView'
import { deleteSplit } from '@database/deleteSplit'
import { getGroupInfo } from '@database/getGroupInfo'
import { getMembers } from '@database/getMembers'
import { getSplits } from '@database/getSplits'
import { setGroupAccess } from '@database/setGroupAccess'
import { setGroupAdmin } from '@database/setGroupAdmin'
import { setGroupHidden } from '@database/setGroupHidden'
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { isSmallScreen } from '@utils/isSmallScreen'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from 'react-native'
import { GroupInfo, Member, SplitInfo } from 'shared'

function useThreeBarLayout() {
  return useWindowDimensions().width > 1024
}

function InfoCard({ info }: { info: GroupInfo }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()

  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceContainer,
        borderRadius: 16,
        gap: 8,
        paddingHorizontal: threeBarLayout ? 0 : 16,
        paddingVertical: threeBarLayout ? 0 : 32,
        marginTop: threeBarLayout ? 0 : 16,
      }}
    >
      <Text style={{ fontSize: 32, color: theme.colors.onSurfaceVariant, marginBottom: 32 }}>
        {info.name}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>Your balance:</Text>
        <Text
          style={{
            fontSize: 24,
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
          justifyContent: 'center',
          gap: 16,
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <FontAwesome name='users' size={20} color={theme.colors.outline} />
          </View>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
            {info.memberCount} Members
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 24, alignItems: 'center' }}>
            <FontAwesome
              name={info.hasAccess ? 'unlock-alt' : 'lock'}
              size={20}
              color={theme.colors.outline}
            />
          </View>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
            {info.hasAccess
              ? 'You have access to this group'
              : "You don't have access to this group"}
          </Text>
        </View>

        {info.isAdmin && (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <FontAwesome name='wrench' size={20} color={theme.colors.outline} />
            </View>
            <Text style={{ color: theme.colors.outline, fontSize: 18 }}>
              You are administrator of this group
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

function ActionButtons({ info }: { info: GroupInfo }) {
  const theme = useTheme()

  return (
    <View style={{ marginVertical: 16, flexDirection: 'column', gap: 8 }}>
      {info.isAdmin && (
        <Link href={`/${info.id}/addUser`} asChild>
          <Button
            title='Add user'
            leftIcon={<Entypo name='plus' size={20} color={theme.colors.onPrimaryContainer} />}
          />
        </Link>
      )}

      <Link href={`/${info.id}/addSplit`} asChild>
        <Button
          title='Add split'
          leftIcon={
            <MaterialIcons name='call-split' size={20} color={theme.colors.onPrimaryContainer} />
          }
        />
      </Link>

      {info.hidden && (
        <Button
          title='Show group'
          onPress={() => {
            setGroupHidden(info.id, false).catch((e) => {
              alert(e.message)
            })
          }}
          leftIcon={
            <MaterialIcons name='visibility' size={240} color={theme.colors.onPrimaryContainer} />
          }
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
          leftIcon={
            <MaterialIcons
              name='visibility-off'
              size={20}
              color={theme.colors.onPrimaryContainer}
            />
          }
        />
      )}
    </View>
  )
}

function GroupInfoPage({ info }: { info: GroupInfo | null }) {
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()

  if (!info) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.onSurface} />
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: threeBarLayout ? 'center' : 'flex-start',
        paddingHorizontal: 16,
        paddingBottom: 96,
        maxWidth: 500,
        alignSelf: 'center',
      }}
    >
      <InfoCard info={info} />
      <ActionButtons info={info} />
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
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ flex: 1, paddingHorizontal: 16 }}
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
                    leftIcon={
                      <MaterialIcons
                        name='delete'
                        size={20}
                        color={theme.colors.onPrimaryContainer}
                      />
                    }
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
    <View style={{ width: '100%', flex: 1, maxWidth: 768, alignSelf: 'center' }}>
      <FlatList
        contentContainerStyle={{ flex: 1, paddingHorizontal: 16 }}
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
                borderColor: theme.colors.outlineVariant,
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
  const threeBarLayout = useThreeBarLayout()
  const smallScreen = isSmallScreen(useWindowDimensions().width)
  const [openedTab, setOpenedTab] = useState(0)

  useEffect(() => {
    if (threeBarLayout && openedTab === 2) {
      setOpenedTab(0)
    }
  }, [openedTab, threeBarLayout])

  const tabs: Tab[] = [
    {
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name='list-ul'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !smallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Splits
            </Text>
          )}
        </View>
      ),
      content: () => <SplitList info={info} />,
    },
    {
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name='users'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !smallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Members
            </Text>
          )}
        </View>
      ),
      content: () => <MembersList info={info} />,
    },
  ]

  if (!threeBarLayout) {
    tabs.unshift({
      header: ({ selected }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Entypo
            name='home'
            size={20}
            color={selected ? theme.colors.primary : theme.colors.outline}
          />
          {(selected || !smallScreen) && (
            <Text
              style={{
                color: selected ? theme.colors.primary : theme.colors.outline,
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              Group
            </Text>
          )}
        </View>
      ),
      content: () => <GroupInfoPage info={info} />,
    })
  }

  return <TabView openedTab={openedTab} tabs={tabs} onTabChange={setOpenedTab} />
}

export default function GroupScreen() {
  const user = useAuth()
  const theme = useTheme()
  const threeBarLayout = useThreeBarLayout()
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

      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
        {threeBarLayout && (
          <View style={{ flex: 1, height: '100%', backgroundColor: theme.colors.surfaceContainer }}>
            <GroupInfoPage info={groupInfo} />
          </View>
        )}
        <View style={{ flex: 2, height: '100%', alignItems: 'center' }}>
          <ContentSwitcher info={groupInfo} />
        </View>
      </View>
    </View>
  )
}
