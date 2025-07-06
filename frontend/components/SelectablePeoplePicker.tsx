import { Icon } from './Icon'
import { ProfilePicture } from './ProfilePicture'
import { Text } from './Text'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useTheme } from '@styling/theme'
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { UserWithDisplayName } from 'shared'

export interface PersonEntry {
  entry: string
  user?: UserWithDisplayName
  selected?: boolean
  picked?: boolean
}

export interface SelectablePeoplePickerRef {
  selectAll: () => void
}

export interface SelectablePeoplePickerProps {
  groupId: number
  onEntriesChange: (entries: PersonEntry[]) => void
  entries: PersonEntry[]
  pickablePayer?: boolean
  ref?: React.RefObject<SelectablePeoplePickerRef | null>
}

interface ListPersonRowProps {
  toggleSelect: () => void
  entry: PersonEntry
  pickable?: boolean
  pick: () => void
}

function ListPersonRow({ toggleSelect, entry, pickable, pick }: ListPersonRowProps) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hover, setHover] = useState(false)
  const selected = entry.selected
  const picked = entry.picked

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: picked
        ? theme.colors.secondaryContainer
        : theme.colors.surfaceContainerHighest,
      opacity: withTiming(selected ? 1 : pressed ? 0.5 : hover ? 0.3 : 0, { duration: 200 }),
    }
  })

  return (
    <Pressable
      onPress={toggleSelect}
      style={{
        paddingVertical: pickable ? 8 : 12,
        paddingLeft: pickable ? 0 : 12,
        paddingRight: 12,
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {pickable && (
          <Pressable
            disabled={!entry.selected || entry.user === undefined}
            onPress={pick}
            style={{ padding: 12, paddingRight: 0 }}
            tabIndex={-1}
          >
            <Icon
              name='payments'
              size={24}
              color={entry.picked ? theme.colors.secondary : theme.colors.outlineVariant}
            />
          </Pressable>
        )}
        <ProfilePicture userId={entry.user?.id} size={32} />
        <View style={{ flexShrink: 1, flexGrow: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: 700 }}
          >
            {entry.user?.displayName ?? entry.user?.name}
          </Text>

          {entry.user?.displayName && (
            <Text
              numberOfLines={1}
              style={{ color: theme.colors.outline, fontSize: 14, fontWeight: 600 }}
            >
              {entry.user?.name}
            </Text>
          )}
        </View>

        <Icon name='check' size={24} color={selected ? theme.colors.onSurface : 'transparent'} />
      </View>
    </Pressable>
  )
}

export function SelectablePeoplePicker({
  groupId,
  onEntriesChange,
  ref,
  entries,
  pickablePayer = false,
}: SelectablePeoplePickerProps) {
  const theme = useTheme()
  const [localEntries, setLocalEntries] = useState<PersonEntry[]>([])
  const { members, hasNextPage, fetchNextPage, isFetchingNextPage } = useGroupMembers(groupId)

  useEffect(() => {
    if (members.length !== 0) {
      const newEntries = members.map((member) => ({
        entry: member.email ?? '',
        user: member,
        selected:
          localEntries.some((e) => e.user?.id === member.id && e.selected) ||
          entries.some((e) => e.user?.id === member.id),
        picked: entries.some((e) => e.user?.id === member.id && e.selected),
      }))
      setLocalEntries(newEntries)
    }

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length])

  useImperativeHandle(ref, () => ({
    selectAll: () => {
      const newEntries = [...localEntries]
      newEntries.forEach((entry) => {
        entry.selected = true
      })
      setLocalEntries(newEntries)
      onEntriesChange(
        localEntries.filter((e) => e.selected).map((e) => ({ ...e, selected: e.picked }))
      )
    },
  }))

  function toggleSelect(index: number) {
    const newEntries = [...localEntries]
    newEntries[index].selected = !newEntries[index].selected
    if (!newEntries[index].selected) {
      newEntries[index].picked = false
    }
    setLocalEntries(newEntries)
    onEntriesChange(
      localEntries.filter((e) => e.selected).map((e) => ({ ...e, selected: e.picked }))
    )
  }

  function pick(index: number) {
    const newEntries = localEntries.map((e) => ({ ...e, picked: false }))
    newEntries[index].picked = true
    setLocalEntries(newEntries)
    onEntriesChange(newEntries.filter((e) => e.selected).map((e) => ({ ...e, selected: e.picked })))
  }

  return (
    <View style={{ gap: 2 }}>
      {localEntries.map((entry, index) => {
        return (
          <View
            key={index}
            style={{
              overflow: 'hidden',
              backgroundColor: theme.colors.surfaceContainer,
              borderRadius: 4,
              borderBottomLeftRadius: localEntries.length - 1 === index ? 16 : 4,
              borderBottomRightRadius: localEntries.length - 1 === index ? 16 : 4,
            }}
          >
            <ListPersonRow
              toggleSelect={() => toggleSelect(index)}
              pick={() => pick(index)}
              entry={entry}
              pickable={pickablePayer}
            />
          </View>
        )
      })}
    </View>
  )
}
