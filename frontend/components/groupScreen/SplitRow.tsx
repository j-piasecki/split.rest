import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useDeleteSplit } from '@hooks/database/useDeleteSplit'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
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
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info.id)
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { mutate: deleteSplit, isPending } = useDeleteSplit(info.id)

  const showDeteteButton = permissions?.canDeleteSplit(split)

  return (
    <Pressable
      key={split.id}
      onPress={() => {
        router.navigate(`/group/${info?.id}/split/${split.id}`)
      }}
      style={{
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceContainer,
      }}
    >
      <View style={{ flex: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
          {split.title}
        </Text>
        {split.version !== 1 && (
          <Text
            style={{
              position: 'absolute',
              bottom: -12,
              fontSize: 10,
              color: theme.colors.outline,
            }}
          >
            {t('splitInfo.edited')}
          </Text>
        )}
      </View>

      {isSmallScreen && <StackedInfo split={split} info={info} />}
      {!isSmallScreen && <LinearInfo split={split} info={info} />}

      <View style={{ width: 48 }}>
        {showDeteteButton && (
          <Button
            leftIcon='delete'
            isLoading={isPending}
            onPress={() => {
              deleteSplit(split.id)
            }}
          />
        )}
      </View>
    </Pressable>
  )
}
