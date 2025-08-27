import { ProfilePicture } from './ProfilePicture'
import { TextInputRef } from './TextInput'
import { TextInputWithSuggestions, TextInputWithSuggestionsProps } from './TextInputWithSuggestions'
import { Text } from '@components/Text'
import { getGroupMemberAutocompletions } from '@database/getGroupMembersAutocompletions'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useTheme } from '@styling/theme'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Member } from 'shared'

interface SuggestionProps {
  user: Member
  hovered?: boolean
  pressed?: boolean
}

function Suggestion({ user, hovered, pressed }: SuggestionProps) {
  const theme = useTheme()
  const { t } = useTranslation()

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
      <ProfilePicture user={user} size={24} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 500 }}>
          {user.displayName ?? user.name}
        </Text>
        {user.displayName && (
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10, fontWeight: 500 }}>
            {user.name}
          </Text>
        )}
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
          {user.deleted ? t('deletedUser') : user.email}
        </Text>
      </View>
    </View>
  )
}

export interface TextInputWithUserSuggestionsProps
  extends Omit<TextInputWithSuggestionsProps<Member>, 'getSuggestions' | 'renderSuggestion'> {
  groupId: number
  onSuggestionSelect: (user: Member) => void
  filterSuggestions?: (suggestions: Member[]) => Member[]
}

export function TextInputWithUserSuggestions({
  groupId,
  onSuggestionSelect,
  onChangeText,
  filterSuggestions,
  ...rest
}: TextInputWithUserSuggestionsProps) {
  const ref = useRef<TextInputRef>(null)
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(groupId)

  const getSuggestions = useCallback(
    async (val: string) => {
      const suggestions =
        groupInfo?.permissions?.canReadMembers?.() || /.*@.+/.test(val)
          ? await getGroupMemberAutocompletions(groupId, val)
          : []

      return filterSuggestions ? filterSuggestions(suggestions) : suggestions
    },
    [groupId, groupInfo?.permissions, filterSuggestions]
  )

  return (
    <TextInputWithSuggestions
      inputRef={ref}
      placeholder={t('form.nameOrEmail')}
      keyboardType='email-address'
      autoComplete='email'
      autoCorrect={false}
      autoCapitalize='none'
      getSuggestions={getSuggestions}
      suggestionsVisible={true}
      onSuggestionSelect={onSuggestionSelect}
      renderSuggestion={(user, hovered, pressed) => {
        return <Suggestion user={user} hovered={hovered} pressed={pressed} />
      }}
      onChangeText={onChangeText}
      {...rest}
    />
  )
}
