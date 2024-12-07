import { Button } from '@components/Button'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useDeleteSplit } from '@hooks/database/useDeleteSplit'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { GroupInfo, SplitInfo } from 'shared'

export interface SplitRowProps {
  split: SplitInfo
  info: GroupInfo
}

function LinearInfo({ split, info }: { split: SplitInfo; info: GroupInfo }) {
  const theme = useTheme()

  return (
    <>
      <View style={{ minWidth: 132, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
          {split.total} {info?.currency}
        </Text>
      </View>
      <View style={{ flex: 2, alignItems: 'center', overflow: 'hidden' }}>
        <Text style={{ fontSize: 20, color: theme.colors.outline }}>
          {new Date(split.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </>
  )
}

function StackedInfo({ split, info }: { split: SplitInfo; info: GroupInfo }) {
  const theme = useTheme()

  return (
    <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>
          {split.total} {info?.currency}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 16, color: theme.colors.outline }}>
          {new Date(split.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )
}

export function SplitRow({ split, info }: SplitRowProps) {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const isSmallScreen = useIsSmallScreen()
  const deleteSplit = useDeleteSplit(info.id)

  const showDeteteButton =
    split.paidById === user?.id || split.createdById === user?.id || info?.isAdmin

  return (
    <Pressable
      key={split.id}
      onPress={() => {
        router.navigate(`${info?.id}/split/${split.id}`)
      }}
      style={{
        paddingVertical: 16,
        paddingHorizontal: isSmallScreen ? 0 : 16,
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

      {isSmallScreen && <StackedInfo split={split} info={info} />}
      {!isSmallScreen && <LinearInfo split={split} info={info} />}

      <View style={{ width: 48 }}>
        {showDeteteButton && (
          <Button
            leftIcon={
              deleteSplit.isPending ? (
                <ActivityIndicator size='small' color={theme.colors.onPrimaryContainer} />
              ) : (
                <MaterialIcons name='delete' size={20} color={theme.colors.onPrimaryContainer} />
              )
            }
            onPress={() => {
              deleteSplit.mutate(split.id)
            }}
          />
        )}
      </View>
    </Pressable>
  )
}
