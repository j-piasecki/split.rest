import { ContextMenu, ContextMenuRef } from '@components/ContextMenu'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { useDeleteSplit } from '@hooks/database/useDeleteSplit'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
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
    <View style={{ paddingHorizontal: 8, alignItems: 'flex-end' }}>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 18, fontWeight: 600, color: theme.colors.onSurface }}>
          {split.total} {info?.currency}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 14, color: theme.colors.outline }}>
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
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const { data: permissions } = useGroupPermissions(info.id)
  const isSmallScreen = useDisplayClass() === DisplayClass.Small
  const { mutate: deleteSplit, isPending } = useDeleteSplit(info.id)

  const contextMenuDisabled =
    !permissions?.canSeeSplitDetails(split) &&
    !permissions?.canUpdateSplit(split) &&
    !permissions?.canDeleteSplit(split)

  return (
    <ContextMenu
      key={split.id}
      ref={contextMenuRef}
      disabled={contextMenuDisabled}
      style={({ pressed }) => {
        return {
          userSelect: 'none',
          backgroundColor:
            pressed && permissions?.canSeeSplitDetails(split)
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceContainer,
        }
      }}
      onPress={() => {
        if (permissions?.canSeeSplitDetails(split)) {
          router.navigate(`/group/${info?.id}/split/${split.id}`)
        }
      }}
      items={[
        {
          label: t('split.showDetails'),
          icon: 'visibility',
          disabled: !permissions?.canSeeSplitDetails(split),
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}`)
          },
        },
        {
          label: t('split.edit'),
          icon: 'edit',
          disabled: !permissions?.canUpdateSplit(split),
          onPress: () => {
            router.navigate(`/group/${info?.id}/split/${split.id}/edit`)
          },
        },
        {
          label: t('split.delete'),
          icon: 'delete',
          disabled: !permissions?.canDeleteSplit(split),
          destructive: true,
          onPress: () => {
            deleteSplit(split.id)
          },
        },
      ]}
    >
      <View
        style={{
          paddingVertical: 16,
          paddingLeft: 16,
          paddingRight: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: getProfilePictureUrl(split.paidById) }}
          style={{ width: 32, height: 32, borderRadius: 18, marginRight: isSmallScreen ? 8 : 16 }}
        />
        <View style={{ flex: 2 }}>
          <Text
            style={{ fontSize: 18, fontWeight: 800, color: theme.colors.onSurface }}
            numberOfLines={3}
          >
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

        <View style={{ width: 40 }}>
          <RoundIconButton
            isLoading={isPending}
            disabled={contextMenuDisabled}
            icon='moreVertical'
            onPress={(e) => {
              contextMenuRef.current?.open({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
            }}
            style={{ opacity: contextMenuDisabled ? 0.4 : 1 }}
          />
        </View>
      </View>
    </ContextMenu>
  )
}
