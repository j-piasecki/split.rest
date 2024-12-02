import Modal from '@components/ModalScreen'
import { getGroupInfo } from '@database/getGroupInfo'
import { getSplitInfo } from '@database/getSplitInfo'
import { getUserById } from '@database/getUserById'
import { useTheme } from '@styling/theme'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { GroupInfo, SplitWithUsers, User, UserWithBalanceChange } from 'shared'

const ColoredText = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme()

  return <Text style={{ color: theme.colors.onSurface }}>{children}</Text>
}

function UserRow({
  user,
  groupInfo,
  splitInfo,
}: {
  user: UserWithBalanceChange
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo | null
}) {
  const paidByThis = splitInfo.paidById === user.id
  let paidInThisSplit = user.change

  if (paidByThis) {
    const total = Number(splitInfo.total)
    const remainder = total - Number(paidInThisSplit)

    paidInThisSplit = `${remainder.toFixed(2)}`
  } else {
    paidInThisSplit = paidInThisSplit.substring(1)
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <ColoredText>{user.name}</ColoredText>
      {paidByThis && <ColoredText>{'<-- this one paid'}</ColoredText>}
      <ColoredText>
        {paidInThisSplit} {groupInfo?.currency}
      </ColoredText>
    </View>
  )
}

function SplitInfo({
  splitInfo,
  groupInfo,
}: {
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo | null
}) {
  const [createdBy, setCreatedBy] = useState<User | null>(null)

  useEffect(() => {
    getUserById(splitInfo.createdById).then(setCreatedBy)
  }, [splitInfo.createdById])

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <ColoredText>Title: {splitInfo.title}</ColoredText>
      <ColoredText>Total: {splitInfo.total}</ColoredText>
      <ColoredText>Date: {new Date(splitInfo.timestamp).toLocaleDateString()}</ColoredText>
      <ColoredText>Created by: {createdBy?.name}</ColoredText>
      <FlatList
        style={{ flex: 1 }}
        data={splitInfo.users}
        renderItem={({ item }) => (
          <UserRow user={item} groupInfo={groupInfo} splitInfo={splitInfo} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

export default function SplitInfoScreen() {
  const theme = useTheme()
  const { id, splitId } = useLocalSearchParams()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [splitInfo, setSplitInfo] = useState<SplitWithUsers | null | undefined>(undefined)

  useEffect(() => {
    const groupIdNum = parseInt(id as string)
    const splitIdNum = parseInt(splitId as string)
    getGroupInfo(groupIdNum).then(setGroupInfo)
    getSplitInfo(groupIdNum, splitIdNum).then(setSplitInfo)
  }, [id, splitId])

  return (
    <Modal title='Split info' returnPath={`/${id}`} maxWidth={500}>
      {splitInfo === undefined && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
        </View>
      )}

      {splitInfo === null && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
            Split not found
          </Text>
        </View>
      )}

      {splitInfo && <SplitInfo splitInfo={splitInfo} groupInfo={groupInfo} />}
    </Modal>
  )
}
