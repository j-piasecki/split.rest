import { TextInputWithSuggestions, TextInputWithSuggestionsProps } from './TextInputWithSuggestions'
import { getGroupMemberAutocompletions } from '@database/getGroupMembersAutocompletions'
import { getProfilePicture } from '@database/getProfilePicture'
import { useTheme } from '@styling/theme'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, Pressable, Text, TextInput as TextInputRN, View } from 'react-native'
import { User } from 'shared'

interface SuggestionProps {
  user: User
  onSelect: () => void
  textInputRef: React.RefObject<TextInputRN>
  setShowSuggestions: (show: boolean) => void
}

function Suggestion({ user, onSelect, textInputRef, setShowSuggestions }: SuggestionProps) {
  const theme = useTheme()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    getProfilePicture(user.id).then(setProfilePicture)
  }, [user.id])

  return (
    <Pressable
      onPointerDown={() => {
        setTimeout(() => {
          textInputRef.current?.focus()
        })
      }}
      onPress={() => {
        onSelect()
        setShowSuggestions(false)
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Image
          source={{ uri: profilePicture ?? undefined }}
          style={{ width: 24, height: 24, borderRadius: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{user.name}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>{user.email}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export interface TextInputWithUserSuggestionsProps
  extends Omit<TextInputWithSuggestionsProps<User>, 'getSuggestions' | 'renderSuggestion'> {
  groupId: number
  onSuggestionSelect: (user: User) => void
}

export function TextInputWithUserSuggestions({
  groupId,
  onSuggestionSelect,
  onChangeText,
  ...rest
}: TextInputWithUserSuggestionsProps) {
  const ref = useRef<TextInputRN>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const getSuggestions = useCallback(
    (val: string) => getGroupMemberAutocompletions(groupId, val),
    [groupId]
  )

  return (
    <TextInputWithSuggestions
      inputRef={ref}
      placeholder='E-mail'
      keyboardType='email-address'
      autoComplete='email'
      autoCorrect={false}
      autoCapitalize='none'
      getSuggestions={getSuggestions}
      suggestionsVisible={showSuggestions}
      renderSuggestion={(user) => {
        return (
          <Suggestion
            user={user}
            onSelect={() => {
              onSuggestionSelect(user)
            }}
            textInputRef={ref}
            setShowSuggestions={setShowSuggestions}
          />
        )
      }}
      onChangeText={(val) => {
        onChangeText?.(val)
        setShowSuggestions(true)
      }}
      {...rest}
    />
  )
}
