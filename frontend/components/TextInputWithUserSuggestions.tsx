import { TextInputWithSuggestions, TextInputWithSuggestionsProps } from './TextInputWithSuggestions'
import { Text } from '@components/Text'
import { getGroupMemberAutocompletions } from '@database/getGroupMembersAutocompletions'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { getProfilePictureUrl } from '@utils/getProfilePictureUrl'
import { Image } from 'expo-image'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput as TextInputRN, View } from 'react-native'
import { User } from 'shared'

interface SuggestionProps {
  user: User
  onSelect: () => void
  textInputRef: React.RefObject<TextInputRN>
  setShowSuggestions: (show: boolean) => void
}

function Suggestion({ user, onSelect, textInputRef, setShowSuggestions }: SuggestionProps) {
  const theme = useTheme()

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
          source={{ uri: getProfilePictureUrl(user.id) }}
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
  const { data: permissions } = useGroupPermissions(groupId)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const { t } = useTranslation()

  const getSuggestions = useCallback(
    async (val: string) =>
      permissions?.canReadMembers() ? await getGroupMemberAutocompletions(groupId, val) : [],
    [groupId, permissions]
  )

  return (
    <TextInputWithSuggestions
      inputRef={ref}
      placeholder={t('email')}
      keyboardType='email-address'
      autoComplete='email'
      autoCorrect={false}
      autoCapitalize='none'
      getSuggestions={getSuggestions}
      suggestionsVisible={showSuggestions && permissions?.canReadMembers()}
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
