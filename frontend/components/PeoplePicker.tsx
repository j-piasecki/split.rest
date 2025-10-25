import { Icon } from './Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useTheme } from '@styling/theme'
import React, { useRef } from 'react'
import { LayoutRectangle, Pressable, ScrollView, View } from 'react-native'
import { Member } from 'shared'

export interface PersonEntry {
  entry: string
  user?: Member
  selected?: boolean
}

interface PersonRowProps {
  groupId: number
  entries: PersonEntry[]
  setEntries: (entries: PersonEntry[]) => void
  selectable?: boolean
  index: number
  entry: PersonEntry
  parentLayout?: React.RefObject<LayoutRectangle | null>
  scrollRef?: React.RefObject<ScrollView | null>
}

function PersonRow({
  groupId,
  entries,
  setEntries,
  selectable,
  index,
  entry,
  parentLayout,
  scrollRef,
}: PersonRowProps) {
  const theme = useTheme()
  const layout = useRef<LayoutRectangle | null>(null)

  const deleteVisible = entry.user !== undefined || entry.entry.trim().length > 0

  function scrollToThis() {
    if (layout.current && parentLayout?.current) {
      const targetScroll = parentLayout.current.y + layout.current.y
      setTimeout(() => {
        scrollRef?.current?.scrollTo({
          y: index === 0 ? targetScroll / 3 : index === 1 ? targetScroll / 2 : targetScroll,
          animated: true,
        })
      }, 100)
    }
  }

  return (
    <View
      onLayout={(event) => {
        layout.current = event.nativeEvent.layout
      }}
      style={{
        backgroundColor: theme.colors.surfaceContainer,
        paddingTop: 4,
        paddingBottom: entries.length - 1 === index ? 12 : 8,
        borderRadius: 4,
        borderBottomLeftRadius: entries.length - 1 === index ? 16 : 4,
        borderBottomRightRadius: entries.length - 1 === index ? 16 : 4,
        zIndex: entries.length - index,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: entries.length - index,
          paddingLeft: 16,
          paddingRight: 2,
        }}
      >
        {selectable && (
          <Pressable
            disabled={entry.selected || entry.user === undefined}
            onPress={() => setEntries(entries.map((e, i) => ({ ...e, selected: i === index })))}
            style={{ marginRight: 8 }}
            tabIndex={-1}
          >
            <Icon
              name='payments'
              size={24}
              color={entry.selected ? theme.colors.secondary : theme.colors.outlineVariant}
            />
          </Pressable>
        )}

        <TextInputUserPicker
          groupId={groupId}
          value={entry.user?.email ?? entry.entry}
          user={entry.user}
          selectTextOnFocus
          focusIndex={index}
          filterSuggestions={(suggestions) =>
            suggestions.filter(
              (suggestion) =>
                suggestion.email === entry.entry ||
                entries.find(
                  (e) => e.entry === suggestion.email || e.user?.email === suggestion.email
                ) === undefined
            )
          }
          onChangeText={(val) => {
            const newEntries = [...entries]
            newEntries[index] = { entry: val, selected: entry.selected, user: entry.user }

            setEntries(newEntries)
          }}
          onSuggestionSelect={(user) => {
            const newEntries = [...entries]
            newEntries[index] = {
              user: user,
              selected: entry.selected,
              entry: user.email ?? '',
            }

            setEntries(newEntries)
          }}
          onClearSelection={() => {
            const newEntries = [...entries]
            newEntries[index] = {
              entry: entry.entry,
              selected: entry.selected,
              user: undefined,
            }

            setEntries(newEntries)
          }}
          containerStyle={{ flex: 1 }}
          onFocus={scrollToThis}
        />
        <View
          style={{
            transform: [{ translateY: 2 }],
            opacity: deleteVisible ? 1 : 0,
          }}
        >
          <RoundIconButton
            disabled={!deleteVisible}
            icon='close'
            size={20}
            onPress={() => {
              setEntries(entries.filter((_, i) => i !== index))
            }}
          />
        </View>
      </View>
    </View>
  )
}

export interface PeoplePickerProps {
  groupId: number
  entries: PersonEntry[]
  onEntriesChange: (entries: PersonEntry[]) => void
  selectable?: boolean
  parentLayout?: React.RefObject<LayoutRectangle | null>
  scrollRef?: React.RefObject<ScrollView | null>
}

export function PeoplePicker({
  groupId,
  entries,
  onEntriesChange,
  selectable = false,
  parentLayout,
  scrollRef,
}: PeoplePickerProps) {
  function cleanupEntries(entries: PersonEntry[]): PersonEntry[] {
    const newEntries = entries.filter(
      (entry) => entry.user !== undefined || entry.entry.trim() !== ''
    )

    if (newEntries.length === 0) {
      newEntries.push({ entry: '' })
    }
    if (newEntries[newEntries.length - 1].entry !== '' || newEntries[newEntries.length - 1].user) {
      newEntries.push({ entry: '' })
    }
    if (selectable && newEntries.every((entry) => !entry.selected)) {
      newEntries[0].selected = true
    }

    return newEntries
  }

  function setEntries(newEntries: PersonEntry[]) {
    onEntriesChange(cleanupEntries(newEntries))
  }

  return (
    <View style={{ gap: 2 }}>
      {entries.map((entry, index) => {
        return (
          <PersonRow
            key={index}
            groupId={groupId}
            entries={entries}
            setEntries={setEntries}
            selectable={selectable}
            index={index}
            entry={entry}
            parentLayout={parentLayout}
            scrollRef={scrollRef}
          />
        )
      })}
    </View>
  )
}
