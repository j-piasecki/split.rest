import { RoundIconButton } from '@components/RoundIconButton'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import React from 'react'
import { View } from 'react-native'
import { User } from 'shared'

export interface PersonEntry {
  email: string
  user?: User
}

export interface PeoplePickerProps {
  groupId: number
  entries: PersonEntry[]
  onEntriesChange: (entries: PersonEntry[]) => void
}

export function PeoplePicker({ groupId, entries, onEntriesChange }: PeoplePickerProps) {
  function cleanupEntries(entries: PersonEntry[]): PersonEntry[] {
    const newEntries = entries.filter((entry) => entry.email.trim() !== '')

    if (newEntries.length === 0) {
      newEntries.push({ email: '' })
    }
    if (newEntries[newEntries.length - 1].email !== '') {
      newEntries.push({ email: '' })
    }

    return newEntries
  }

  function setEntries(newEntries: PersonEntry[]) {
    onEntriesChange(cleanupEntries(newEntries))
  }

  return (
    <View>
      {entries.map((entry, index) => {
        const deleteVisible = entry.email.trim().length > 0
        return (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: entries.length - index,
            }}
          >
            <TextInputUserPicker
              key={index}
              groupId={groupId}
              value={entry.email}
              user={entry.user}
              selectTextOnFocus
              filterSuggestions={(suggestions) =>
                suggestions.filter(
                  (s) =>
                    s.email === entry.email ||
                    entries.find((e) => e.email === s.email) === undefined
                )
              }
              onChangeText={(val) => {
                const newEntries = [...entries]
                newEntries[index] = { email: val, user: undefined }

                setEntries(newEntries)
              }}
              onSuggestionSelect={(user) => {
                const newEntries = [...entries]
                newEntries[index] = { email: user.email, user }

                setEntries(newEntries)
              }}
              onClearSelection={() => {
                const newEntries = [...entries]
                newEntries[index] = { email: entry.email, user: undefined }

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
