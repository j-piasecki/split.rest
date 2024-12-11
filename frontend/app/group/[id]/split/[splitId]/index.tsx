import { Button } from '@components/Button'
import Modal from '@components/ModalScreen'
import { getUserById } from '@database/getUserById'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSplitInfo } from '@hooks/database/useSplitInfo'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'
import { GroupInfo, SplitWithUsers, User, UserWithBalanceChange } from 'shared'

function UserRow({
  user,
  groupInfo,
  splitInfo,
}: {
  user: UserWithBalanceChange
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo | undefined
}) {
  const theme = useTheme()

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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <Image
        source={{ uri: getProfilePictureUrl(user.id) }}
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 20 }}>{user.name}</Text>
        <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{user.email}</Text>
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
        {paidInThisSplit} {groupInfo?.currency}
      </Text>
    </View>
  )
}

function SplitInfo({
  splitInfo,
  groupInfo,
}: {
  splitInfo: SplitWithUsers
  groupInfo: GroupInfo | undefined
}) {
  const theme = useTheme()
  const user = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [createdBy, setCreatedBy] = useState<User | null>(null)
  const paidBy = splitInfo.users.find((user) => user.id === splitInfo.paidById)!

  useEffect(() => {
    getUserById(splitInfo.createdById).then(setCreatedBy)
  }, [splitInfo.createdById])

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontSize: 24 }}>{splitInfo.title}</Text>
        <Text style={{ color: theme.colors.outline, fontSize: 20 }}>
          {new Date(splitInfo.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={{ color: theme.colors.onSurface, fontSize: 12, opacity: 0.7, textAlign: 'center' }}
      >
        {t('splitInfo.createdBy')}{' '}
        <Text style={{ color: theme.colors.primary }}>
          {createdBy?.name} ({createdBy?.email})
        </Text>
      </Text>
      <FlatList
        style={{ flex: 1, marginVertical: 16 }}
        data={splitInfo.users}
        renderItem={({ item }) => (
          <UserRow user={item} groupInfo={groupInfo} splitInfo={splitInfo} />
        )}
        keyExtractor={(item) => item.id}
      />

      <Text
        style={{
          textAlign: 'center',
          color: theme.colors.outline,
          fontSize: 20,
          opacity: 0.7,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: theme.colors.primary }}>{paidBy.email} </Text>
        {t('splitInfo.hasPaid')}
        <Text style={{ color: theme.colors.primary }}> {splitInfo.total} </Text>
        {groupInfo?.currency}
      </Text>

      {(groupInfo?.isAdmin ||
        splitInfo.createdById === user?.id ||
        splitInfo.paidById === user?.id) && (
        <View style={{ marginBottom: 32 }}>
          <Button
            title={t('splitInfo.edit')}
            leftIcon={
              <MaterialIcons name='edit-note' size={24} color={theme.colors.onPrimaryContainer} />
            }
            onPress={() => router.navigate(`/group/${groupInfo?.id}/split/${splitInfo.id}/edit`)}
          />
        </View>
      )}
    </View>
  )
}

export default function SplitInfoScreen() {
  const theme = useTheme()
  const { id, splitId } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: splitInfo } = useSplitInfo(Number(id), Number(splitId))

  return (
    <Modal title={t('screenName.splitInfo')} returnPath={`/group/${id}`} maxWidth={500}>
      {splitInfo === undefined && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='small' color={theme.colors.onSurface} />
        </View>
      )}

      {splitInfo === null && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 20 }}>
            {t('splitInfo.splitNotFound')}
          </Text>
        </View>
      )}

      {splitInfo && <SplitInfo splitInfo={splitInfo} groupInfo={groupInfo} />}
    </Modal>
  )
}
