import { Icon } from './Icon'
import { RoundIconButton } from '@components/RoundIconButton'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useTheme } from '@styling/theme'
import React from 'react'
import { Pressable, View } from 'react-native'
import { User } from 'shared'

export interface PersonEntry {
  email: string
  selected?: boolean
  user?: User
}

export interface PeoplePickerProps {
  groupId: number
  entries: PersonEntry[]
  onEntriesChange: (entries: PersonEntry[]) => void
  selectable?: boolean
}

export function PeoplePicker({
  groupId,
  entries,
  onEntriesChange,
  selectable = false,
}: PeoplePickerProps) {
  const theme = useTheme()

  function cleanupEntries(entries: PersonEntry[]): PersonEntry[] {
    const newEntries = entries.filter((entry) => entry.email.trim() !== '')

    if (newEntries.length === 0) {
      newEntries.push({ email: '' })
    }
    if (newEntries[newEntries.length - 1].email !== '') {
      newEntries.push({ email: '' })
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
    <View style={{ gap: 8 }}>
      {entries.map((entry, index) => {
        const deleteVisible = entry.email.trim().length > 0
        return (
          <View
            key={index}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: entries.length - index,
            }}
          >
            {selectable && (
              <Pressable
                disabled={entry.selected || entry.email.indexOf('@') === -1}
                onPress={() => setEntries(entries.map((e, i) => ({ ...e, selected: i === index })))}
                style={{ marginRight: 8 }}
                tabIndex={-1}
              >
                <Icon
                  name='currency'
                  size={24}
                  color={entry.selected ? theme.colors.secondary : theme.colors.outlineVariant}
                />
              </Pressable>
            )}

            <TextInputUserPicker
              groupId={groupId}
              value={entry.email}
              user={entry.user}
              selectTextOnFocus
              focusIndex={index}
              filterSuggestions={(suggestions) =>
                suggestions.filter(
                  (s) =>
                    s.email === entry.email ||
                    entries.find((e) => e.email === s.email) === undefined
                )
              }
              onChangeText={(val) => {
                const newEntries = [...entries]
                newEntries[index] = { email: val, user: undefined, selected: entry.selected }

                setEntries(newEntries)
              }}
              onSuggestionSelect={(user) => {
                const newEntries = [...entries]
                newEntries[index] = { email: user.email, user, selected: entry.selected }

                setEntries(newEntries)
              }}
              onClearSelection={() => {
                const newEntries = [...entries]
                newEntries[index] = {
                  email: entry.email,
                  user: undefined,
                  selected: entry.selected,
                }

                setEntries(newEntries)
              }}
              containerStyle={{ flex: 1 }}
            />
            <View
              style={{
                width: 20,
                height: 20,
                marginHorizontal: 4,
                marginBottom: 4,
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
                style={{ position: 'absolute' }}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}
