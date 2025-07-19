import { Icon } from '@components/Icon'
import { FullPaneHeader } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { CurrencyUtils, GroupUserInfo, SplitInfo, isInversedSplit } from 'shared'

function ActionableSplit({
  split,
  info,
  last,
}: {
  split: SplitInfo
  info: GroupUserInfo | undefined
  last: boolean
}) {
  const theme = useTheme()
  const user = useAuth()!
  const router = useRouter()
  const { t } = useTranslation()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const inverseSplit = isInversedSplit(split.type)
  const paidByThis = split.paidById === user.id

  const text = paidByThis
    ? inverseSplit
      ? t('actionableSplits.youAreOwed', {
          amount: CurrencyUtils.format(split.total, info?.currency),
        })
      : t('actionableSplits.youOwe', {
          amount: CurrencyUtils.format(split.total, info?.currency),
        })
    : inverseSplit
      ? t('actionableSplits.youOwe', {
          amount: CurrencyUtils.format(split.pendingChange!, info?.currency),
        })
      : t('actionableSplits.youAreOwed', {
          amount: CurrencyUtils.format(split.pendingChange!, info?.currency),
        })
  const textColor = paidByThis
    ? inverseSplit
      ? theme.colors.balancePositive
      : theme.colors.balanceNegative
    : inverseSplit
      ? theme.colors.balanceNegative
      : theme.colors.balancePositive

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.tertiaryContainer,
          borderRadius: 4,
          overflow: 'hidden',
          // @ts-expect-error userSelect is not a valid style property on mobile
          userSelect: 'none',
        },
        last && {
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: theme.colors.inverseSurface,
            opacity: pressed ? 0.1 : hovered ? 0.05 : 0,
          },
        ]}
      />
      <Pressable
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={() => {
          router.navigate(`/group/${info?.id}/split/${split.id}`)
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <ProfilePicture size={32} userId={split.paidById} />
          <Text style={{ color: textColor, fontSize: 18, fontWeight: 700 }}>{text}</Text>
        </View>
        <Icon name='chevronForward' size={20} color={theme.colors.onTertiaryContainer} />
      </Pressable>
    </View>
  )
}

export function ActionableSplitsPane({
  info,
  style,
}: {
  info: GroupUserInfo | undefined
  style?: StyleProp<ViewStyle>
}) {
  const theme = useTheme()
  const user = useAuth()!
  const { t } = useTranslation()

  // Let's assume that showing at most 20 pending splits is enough
  // and there's no need to try fetching more pages
  const { splits: splits } = useGroupSplitsQuery(info?.id, {
    participants: { type: 'oneOf', ids: [user.id] },
    pending: true,
  })

  const actionableSplits = splits.filter((split) => {
    if (split.paidById === user.id) {
      return true
    }

    return split.pendingChange !== undefined && Number(split.pendingChange) !== 0
  })

  if (actionableSplits.length === 0) {
    return null
  }

  return (
    <View style={style}>
      <FullPaneHeader
        icon='payments'
        title={t('actionableSplits.title')}
        textLocation='start'
        adjustsFontSizeToFit
        style={{ backgroundColor: theme.colors.tertiaryContainer }}
        color={theme.colors.onTertiaryContainer}
      />
      <View style={{ gap: 2 }}>
        {actionableSplits.map((split, index) => (
          <ActionableSplit
            key={split.id}
            split={split}
            info={info}
            last={index === actionableSplits.length - 1}
          />
        ))}
      </View>
    </View>
  )
}
