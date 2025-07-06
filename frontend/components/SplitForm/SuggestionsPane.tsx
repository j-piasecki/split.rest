import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { Text } from '@components/Text'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useSplitParticipantsSuggestions } from '@hooks/database/useSplitParticipantsSuggestions'
import { useTheme } from '@styling/theme'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet } from 'react-native'
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { GroupUserInfo, UserWithDisplayName } from 'shared'

interface SuggestionsPaneProps {
  groupInfo: GroupUserInfo
  hiddenIds: string[]
  onSelect: (user: UserWithDisplayName) => void
}

function Suggestion({
  suggestion,
  onSelect,
}: {
  suggestion: UserWithDisplayName
  onSelect: () => void
}) {
  const theme = useTheme()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed ? 1.025 : 1, {
            damping: 12,
            stiffness: 200,
            restSpeedThreshold: 0.0001,
          }),
        },
      ],
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: theme.colors.surfaceContainerHighest,
      opacity: withTiming(pressed ? 1 : hovered ? 0.6 : 0.3, { duration: 200 }),
    }
  })

  return (
    <Animated.View style={[animatedContainerStyle, { flex: 1 }]}>
      <Pressable
        key={suggestion.id}
        onPress={() => onSelect()}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 16,
          padding: 8,
          gap: 2,
          minWidth: 96,
          maxWidth: 160,
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: theme.colors.surfaceContainer,
        }}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]} />
        <ProfilePicture userId={suggestion.id} size={72} />
        <Text
          numberOfLines={1}
          style={{ fontSize: 16, fontWeight: 700, color: theme.colors.onSurface }}
        >
          {suggestion.displayName ?? suggestion.name}
        </Text>
        {suggestion.displayName && (
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, fontWeight: 600, color: theme.colors.outline }}
          >
            {suggestion.name}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

export function SuggestionsPane({ groupInfo, hiddenIds, onSelect }: SuggestionsPaneProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(groupInfo.id)
  const { data: participantsSuggestions, isLoading } = useSplitParticipantsSuggestions(groupInfo.id)
  const [collapsed, setCollapsed] = useState(false)

  const filteredSuggestions = useMemo(
    () => participantsSuggestions?.filter((suggestion) => !hiddenIds.includes(suggestion.id)),
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participantsSuggestions, hiddenIds.length]
  )

  useEffect(() => {
    if (filteredSuggestions?.length === 0 && !isLoading) {
      setCollapsed(true)
    }
  }, [filteredSuggestions, isLoading])

  if (!permissions?.canReadMembers()) {
    return null
  }

  return (
    <Pane
      icon='automation'
      title={t('form.suggestions')}
      textLocation='start'
      collapsible
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
      containerStyle={{ overflow: 'hidden' }}
    >
      {!collapsed && (
        <ScrollView
          horizontal
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ flexGrow: 1, gap: 8, padding: 12 }}
        >
          {filteredSuggestions?.map((suggestion) => (
            <Animated.View
              key={suggestion.id}
              layout={Platform.OS !== 'web' ? LinearTransition : undefined}
            >
              <Suggestion
                suggestion={suggestion}
                onSelect={() => {
                  onSelect(suggestion)

                  if (filteredSuggestions?.length === 1) {
                    setCollapsed(true)
                  }
                }}
              />
            </Animated.View>
          ))}
          {filteredSuggestions?.length === 0 && isLoading && (
            <ActivityIndicator
              size='small'
              color={theme.colors.onSurface}
              style={{ padding: 12 }}
            />
          )}
          {filteredSuggestions?.length === 0 && !isLoading && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.colors.outline,
                flex: 1,
                textAlign: 'center',
                padding: 12,
              }}
            >
              {t('form.noSuggestions')}
            </Text>
          )}
        </ScrollView>
      )}
    </Pane>
  )
}
