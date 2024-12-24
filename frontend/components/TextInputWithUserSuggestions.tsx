import { ProfilePicture } from './ProfilePicture'
import { TextInputWithSuggestions, TextInputWithSuggestionsProps } from './TextInputWithSuggestions'
import { Text } from '@components/Text'
import { getGroupMemberAutocompletions } from '@database/getGroupMembersAutocompletions'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTheme } from '@styling/theme'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput as TextInputRN, View } from 'react-native'
import { User } from 'shared'

interface SuggestionProps {
  user: User
  hovered?: boolean
  pressed?: boolean
}

function Suggestion({ user, hovered, pressed }: SuggestionProps) {
  const theme = useTheme()

  return (
    <View
      style={{
        backgroundColor: pressed
          ? theme.colors.surfaceBright
          : hovered
            ? theme.colors.surfaceContainerHighest
            : theme.colors.surfaceContainerHigh,
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <ProfilePicture userId={user.id} size={24} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 500 }}>
          {user.name}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>{user.email}</Text>
      </View>
    </View>
  )
}

export interface TextInputWithUserSuggestionsProps
  extends Omit<TextInputWithSuggestionsProps<User>, 'getSuggestions' | 'renderSuggestion'> {
  groupId: number
  onSuggestionSelect: (user: User) => void
  filterSuggestions?: (suggestions: User[]) => User[]
}

export function TextInputWithUserSuggestions({
  groupId,
  onSuggestionSelect,
  onChangeText,
  filterSuggestions,
  ...rest
}: TextInputWithUserSuggestionsProps) {
  const ref = useRef<TextInputRN>(null)
  const { data: permissions } = useGroupPermissions(groupId)
  const { t } = useTranslation()

  const getSuggestions = useCallback(
    async (val: string) => {
      const suggestions = permissions?.canReadMembers()
        ? await getGroupMemberAutocompletions(groupId, val)
        : []

      return filterSuggestions ? filterSuggestions(suggestions) : suggestions
    },
    [groupId, permissions, filterSuggestions]
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
      suggestionsVisible={permissions?.canReadMembers()}
      onSuggestionSelect={onSuggestionSelect}
      renderSuggestion={(user, hovered, pressed) => {
        return <Suggestion user={user} hovered={hovered} pressed={pressed} />
      }}
      onChangeText={onChangeText}
      {...rest}
    />
  )
}
