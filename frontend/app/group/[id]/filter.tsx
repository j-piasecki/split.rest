import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { RoundIconButton } from '@components/RoundIconButton'
import { Text } from '@components/Text'
import { TextInput, TextInputRef } from '@components/TextInput'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import {
  getSplitQueryConfig,
  resetSplitQueryConfig,
  setSplitQueryConfig,
} from '@hooks/useSplitQueryConfig'
import {
  SplitQueryActionType,
  buildQuery,
  useSplitQueryConfigBuilder,
} from '@hooks/useSplitQueryConfigBuilder'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { SplitQueryConfig } from '@utils/splitQueryConfig'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import { validateQuery } from 'shared'

interface QueryProps {
  query: SplitQueryConfig
  updateQuery: (action: SplitQueryActionType) => void
}

function FilterTitle({ query, updateQuery }: QueryProps) {
  const theme = useTheme()
  const textInputRef = useRef<TextInputRef>(null)
  const { t } = useTranslation()

  return (
    <Pressable
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 4,
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceContainer,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => textInputRef.current?.focus()}
    >
      <TextInput
        ref={textInputRef}
        placeholder={t('filter.titleFilter')}
        value={query.titleFilter}
        onChangeText={(text) => updateQuery({ type: 'setTitle', title: text })}
        style={{ flex: 1 }}
        inputStyle={{ fontSize: 16 }}
        showUnderline={false}
      />
      <RoundIconButton
        icon='matchCase'
        color={query.titleCaseSensitive ? theme.colors.primary : undefined}
        onPress={() =>
          updateQuery({ type: 'setCaseSensitive', caseSensitive: !query.titleCaseSensitive })
        }
        style={{ marginTop: 4 }}
      />
      <RoundIconButton
        icon='regex'
        color={query.titleRegex ? theme.colors.primary : undefined}
        onPress={() => updateQuery({ type: 'setRegex', regex: !query.titleRegex })}
        style={{ marginTop: 4 }}
      />
    </Pressable>
  )
}

function FilterForm({ query, updateQuery }: QueryProps) {
  return (
    <View style={{ flexGrow: 1 }}>
      <FilterTitle query={query} updateQuery={updateQuery} />
    </View>
  )
}

function FilterSelector() {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()
  const [query, updateQuery] = useSplitQueryConfigBuilder(getSplitQueryConfig(Number(groupId)))
  const [error, setError] = useTranslatedError()

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(`/group/${groupId}`)
    }
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: 24,
          justifyContent: 'space-between',
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
        }}
        keyboardShouldPersistTaps='handled'
      >
        <FilterForm query={query} updateQuery={updateQuery} />
      </ScrollView>

      {error && (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text
            style={{
              color: theme.colors.error,
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      )}

      <View
        style={{
          gap: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <Button
          leftIcon='erase'
          pressableStyle={{ paddingHorizontal: 4 }}
          destructive
          onPress={() => {
            goBack()
            resetSplitQueryConfig(Number(groupId))
          }}
        />

        <Button
          leftIcon='check'
          title={t('filter.apply')}
          style={{ flex: 1 }}
          onPress={() => {
            try {
              validateQuery(buildQuery(query))
              goBack()
              setSplitQueryConfig(Number(groupId), query)
            } catch (e) {
              setError(e)
            }
          }}
        />
      </View>
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.filter')}
      maxWidth={400}
      maxHeight={600}
    >
      <FilterSelector />
    </ModalScreen>
  )
}
