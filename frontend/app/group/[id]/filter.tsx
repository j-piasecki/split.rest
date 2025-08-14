import { Button } from '@components/Button'
import { Calendar } from '@components/Calendar'
import { Icon, IconName } from '@components/Icon'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { ProfilePicture } from '@components/ProfilePicture'
import { RoundIconButton } from '@components/RoundIconButton'
import { SegmentedButton, SegmentedButtonShowTitle } from '@components/SegmentedButton'
import { Text } from '@components/Text'
import { TextInput, TextInputRef } from '@components/TextInput'
import { TextInputWithUserSuggestions } from '@components/TextInputWithUserSuggestions'
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
import { measure } from '@utils/measure'
import { SplitQueryConfig, defaultQueryConfig } from '@utils/splitQueryConfig'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { Member, SplitType, validateQuery } from 'shared'

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
        onChangeText={(text) => updateQuery({ type: 'setTitle', title: text ? text : undefined })}
        style={{ flex: 1 }}
        inputStyle={{ fontSize: 16 }}
        showUnderline={false}
      />
      <View style={{ marginTop: 4, flexDirection: 'row' }}>
        <RoundIconButton
          icon='matchCase'
          color={query.titleCaseSensitive ? theme.colors.primary : undefined}
          onPress={() =>
            updateQuery({ type: 'setCaseSensitive', caseSensitive: !query.titleCaseSensitive })
          }
        />
        <RoundIconButton
          icon='regex'
          color={query.titleRegex ? theme.colors.primary : undefined}
          onPress={() => updateQuery({ type: 'setRegex', regex: !query.titleRegex })}
        />
      </View>
    </Pressable>
  )
}

function ChipPeoplePicker({
  groupId,
  selected,
  onRemove,
  onAdd,
}: {
  groupId: number
  selected: Member[]
  onRemove: (id: string) => void
  onAdd: (user: Member) => void
}) {
  const theme = useTheme()
  const containerRef = useRef<View>(null)
  const [currentValue, setCurrentValue] = useState('')
  const [maxChipWidth, setMaxChipWidth] = useState(300)

  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = measure(containerRef.current).width
      setMaxChipWidth(Math.floor((width - 8) / 2))
    }
  }, [])

  return (
    <Animated.View style={{ gap: 8 }} ref={containerRef}>
      <Animated.View
        layout={Platform.OS !== 'web' ? LinearTransition : undefined}
        style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {selected.map((user) => (
          <Animated.View
            layout={Platform.OS !== 'web' ? LinearTransition : undefined}
            key={user.id}
          >
            <Pressable
              onPress={() => onRemove(user.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                gap: 8,
                paddingHorizontal: 8,
                height: 32,
                alignItems: 'center',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                backgroundColor: pressed ? theme.colors.outlineVariant : undefined,
                maxWidth: maxChipWidth,
              })}
            >
              <ProfilePicture userId={user.id} size={24} />
              <Text
                style={{ flexShrink: 1, fontSize: 18, color: theme.colors.onSurface }}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {user.name}
              </Text>
              <Icon name='close' size={20} color={theme.colors.onSurface} />
            </Pressable>
          </Animated.View>
        ))}

        <TextInputWithUserSuggestions
          groupId={groupId}
          style={{ flex: 1, minWidth: maxChipWidth }}
          filterSuggestions={(result) => {
            return result.filter((user) => !selected.some((u) => u.id === user.id))
          }}
          onSuggestionSelect={(user) => {
            onAdd(user)
            setCurrentValue('')
          }}
          value={currentValue}
          onChangeText={setCurrentValue}
        />
      </Animated.View>
    </Animated.View>
  )
}

function FilterParticipants({ query, updateQuery }: QueryProps) {
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(!query.participants?.length)

  function setParticipantsMode(mode: 'all' | 'oneOf') {
    updateQuery({ type: 'setParticipantsMode', participantsMode: mode })
  }

  return (
    <Pane
      icon='group'
      title={t('filter.participants')}
      textLocation='start'
      collapsible
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
      containerStyle={{ overflow: 'visible' }}
    >
      {!collapsed && (
        <View style={{ padding: 12, paddingTop: 4, gap: 12 }}>
          <SegmentedButton
            items={[
              {
                title: t('filter.participantsMode.all'),
                icon: 'allOf',
                onPress: () => setParticipantsMode('all'),
                selected: query.participantsMode === 'all',
              },
              {
                title: t('filter.participantsMode.oneOf'),
                icon: 'oneOf',
                onPress: () => setParticipantsMode('oneOf'),
                selected: query.participantsMode !== 'all',
              },
            ]}
          />
          <ChipPeoplePicker
            groupId={Number(groupId)}
            selected={query.participants || []}
            onRemove={(id) => updateQuery({ type: 'removeParticipant', id })}
            onAdd={(user) => updateQuery({ type: 'addParticipant', participant: user })}
          />
        </View>
      )}
    </Pane>
  )
}

function FilterOrderBy({ query, updateQuery }: QueryProps) {
  const { t } = useTranslation()

  return (
    <View style={{ gap: 8 }}>
      <SegmentedButton
        showTitle={SegmentedButtonShowTitle.Selected}
        items={[
          {
            title: t('filter.orderBy.createdAt'),
            icon: 'schedule',
            selected: query.orderBy === 'createdAt',
            onPress: () => updateQuery({ type: 'setOrderBy', orderBy: 'createdAt' }),
          },
          {
            title: t('filter.orderBy.updatedAt'),
            icon: 'calendarEdit',
            selected: query.orderBy === 'updatedAt',
            onPress: () => updateQuery({ type: 'setOrderBy', orderBy: 'updatedAt' }),
          },
          {
            title: t('filter.orderBy.total'),
            icon: 'money',
            selected: query.orderBy === 'total',
            onPress: () => updateQuery({ type: 'setOrderBy', orderBy: 'total' }),
          },
          {
            title: t('filter.orderBy.balanceChange'),
            icon: 'change',
            selected: query.orderBy === 'balanceChange',
            onPress: () => updateQuery({ type: 'setOrderBy', orderBy: 'balanceChange' }),
          },
          {
            title: t('filter.orderBy.timestamp'),
            icon: 'calendar',
            selected: query.orderBy === 'timestamp',
            onPress: () => updateQuery({ type: 'setOrderBy', orderBy: 'timestamp' }),
          },
        ]}
      />

      <SegmentedButton
        items={[
          {
            title: t('filter.ascending'),
            icon: 'arrowUpAlt',
            selected: query.orderDirection === 'asc',
            onPress: () => updateQuery({ type: 'setOrderDirection', orderDirection: 'asc' }),
          },
          {
            title: t('filter.descending'),
            icon: 'arrowDownAlt',
            selected: query.orderDirection === 'desc',
            onPress: () => updateQuery({ type: 'setOrderDirection', orderDirection: 'desc' }),
          },
        ]}
      />
    </View>
  )
}

function FilterUserArray({
  people,
  onAdd,
  onRemove,
  title,
  icon,
}: {
  title: string
  icon: IconName
  people: Member[] | undefined
  onAdd: (user: Member) => void
  onRemove: (id: string) => void
}) {
  const { id: groupId } = useLocalSearchParams()
  const [collapsed, setCollapsed] = useState(!people?.length)

  return (
    <Pane
      icon={icon}
      title={title}
      textLocation='start'
      collapsible
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
      containerStyle={{ overflow: 'visible' }}
    >
      {!collapsed && (
        <View style={{ padding: 12, paddingTop: 4, gap: 12 }}>
          <ChipPeoplePicker
            groupId={Number(groupId)}
            selected={people || []}
            onRemove={onRemove}
            onAdd={onAdd}
          />
        </View>
      )}
    </Pane>
  )
}

function FilterTimestampRange({
  title,
  icon,
  beforeTimestamp,
  afterTimestamp,
  onBeforeTimestampChange,
  onAfterTimestampChange,
}: {
  title: string
  icon: IconName
  beforeTimestamp?: number
  afterTimestamp?: number
  onBeforeTimestampChange: (timestamp?: number) => void
  onAfterTimestampChange: (timestamp?: number) => void
}) {
  const [collapsed, setCollapsed] = useState(!beforeTimestamp && !afterTimestamp)
  const { t } = useTranslation()

  return (
    <Pane
      icon={icon}
      title={title}
      textLocation='start'
      collapsible
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
      containerStyle={{ overflow: 'visible' }}
    >
      {!collapsed && (
        <View style={{ padding: 12, paddingTop: 8 }}>
          <Calendar
            allowRangeSelection
            selectedStartDate={afterTimestamp ? new Date(afterTimestamp) : undefined}
            selectedEndDate={beforeTimestamp ? new Date(beforeTimestamp) : undefined}
            onDateChange={(timestamp, type) => {
              if (type === 'START_DATE') {
                onAfterTimestampChange(timestamp)
              } else if (type === 'END_DATE') {
                onBeforeTimestampChange(timestamp)
              }
            }}
          />

          <View style={{ alignSelf: 'flex-end' }}>
            <RoundIconButton
              icon='erase'
              onPress={() => {
                onAfterTimestampChange(undefined)
                onBeforeTimestampChange(undefined)
              }}
              text={t('filter.clearSelection')}
            />
          </View>
        </View>
      )}
    </Pane>
  )
}

function FilterSplitTypes({ query, updateQuery }: QueryProps) {
  const selectedTypes = new Set(query.splitTypes)
  const defaultTypes = new Set(defaultQueryConfig.splitTypes)
  const isDefault =
    selectedTypes.size === defaultTypes.size &&
    query.splitTypes?.every((type) => defaultTypes.has(type))

  const [collapsed, setCollapsed] = useState(isDefault)
  const { t } = useTranslation()

  return (
    <Pane
      icon='split'
      title={t('filter.splitTypes')}
      textLocation='start'
      containerStyle={{ overflow: 'visible' }}
      collapsible
      startCollapsed
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
    >
      {!collapsed && (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
          <SegmentedButton
            showTitle={SegmentedButtonShowTitle.Never}
            items={[
              {
                icon: 'exactAmount',
                selected: query.splitTypes?.includes(SplitType.Normal),
                onPress: () =>
                  updateQuery({ type: 'toggleSplitType', splitType: SplitType.Normal }),
              },
              {
                icon: 'balance',
                selected: query.splitTypes?.includes(SplitType.SettleUp),
                onPress: () =>
                  updateQuery({ type: 'toggleSplitType', splitType: SplitType.SettleUp }),
              },
              {
                icon: 'barChart',
                selected: query.splitTypes?.includes(SplitType.BalanceChange),
                onPress: () =>
                  updateQuery({ type: 'toggleSplitType', splitType: SplitType.BalanceChange }),
              },
              {
                icon: 'payment',
                selected: query.splitTypes?.includes(SplitType.Lend),
                onPress: () => updateQuery({ type: 'toggleSplitType', splitType: SplitType.Lend }),
              },
              {
                icon: 'schedule',
                selected: query.splitTypes?.includes(SplitType.Delayed),
                onPress: () =>
                  updateQuery({ type: 'toggleSplitType', splitType: SplitType.Delayed }),
              },
            ]}
          />
        </View>
      )}
    </Pane>
  )
}

function FilterForm({ query, updateQuery }: QueryProps) {
  const { t } = useTranslation()

  return (
    <View style={{ flexGrow: 1, gap: 16 }}>
      <View style={{ zIndex: 20 }}>
        <FilterTitle query={query} updateQuery={updateQuery} />
      </View>
      <View style={{ zIndex: 19 }}>
        <FilterOrderBy query={query} updateQuery={updateQuery} />
      </View>
      <View style={{ zIndex: 18 }}>
        <FilterParticipants query={query} updateQuery={updateQuery} />
      </View>
      <View style={{ zIndex: 17 }}>
        <FilterUserArray
          title={t('filter.paidBy')}
          icon='payments'
          people={query.paidBy}
          onAdd={(user) => updateQuery({ type: 'addPaidBy', participant: user })}
          onRemove={(id) => updateQuery({ type: 'removePaidBy', id })}
        />
      </View>
      <View style={{ zIndex: 16 }}>
        <FilterUserArray
          title={t('filter.lastUpdateBy')}
          icon='articlePerson'
          people={query.lastUpdateBy}
          onAdd={(user) => updateQuery({ type: 'addLastUpdateBy', participant: user })}
          onRemove={(id) => updateQuery({ type: 'removeLastUpdateBy', id })}
        />
      </View>
      <View style={{ zIndex: 15 }}>
        <FilterTimestampRange
          title={t('filter.timestampRange')}
          icon='calendar'
          beforeTimestamp={query.beforeTimestamp}
          afterTimestamp={query.afterTimestamp}
          onBeforeTimestampChange={(timestamp) =>
            updateQuery({ type: 'setBeforeTimestamp', beforeTimestamp: timestamp })
          }
          onAfterTimestampChange={(timestamp) =>
            updateQuery({ type: 'setAfterTimestamp', afterTimestamp: timestamp })
          }
        />
      </View>
      <View style={{ zIndex: 14 }}>
        <FilterTimestampRange
          title={t('filter.updateRange')}
          icon='calendarEdit'
          beforeTimestamp={query.lastUpdateBeforeTimestamp}
          afterTimestamp={query.lastUpdateAfterTimestamp}
          onBeforeTimestampChange={(timestamp) =>
            updateQuery({
              type: 'setLastUpdateBeforeTimestamp',
              lastUpdateBeforeTimestamp: timestamp,
            })
          }
          onAfterTimestampChange={(timestamp) =>
            updateQuery({
              type: 'setLastUpdateAfterTimestamp',
              lastUpdateAfterTimestamp: timestamp,
            })
          }
        />
      </View>
      <View style={{ zIndex: 13 }}>
        <FilterSplitTypes query={query} updateQuery={updateQuery} />
      </View>
      <View style={{ zIndex: 12 }}>
        <SegmentedButton
          items={[
            {
              title: t('filter.all'),
              icon: 'allOf',
              selected: query.edited === undefined,
              onPress: () => updateQuery({ type: 'setEdited', edited: undefined }),
            },
            {
              title: t('filter.edited'),
              icon: 'editAlt',
              selected: query.edited === true,
              onPress: () => updateQuery({ type: 'setEdited', edited: true }),
            },
            {
              title: t('filter.notEdited'),
              icon: 'editOff',
              selected: query.edited === false,
              onPress: () => updateQuery({ type: 'setEdited', edited: false }),
            },
          ]}
        />
      </View>
      <View style={{ zIndex: 11 }}>
        <SegmentedButton
          items={[
            {
              title: t('filter.all'),
              icon: 'allOf',
              selected: query.pending === undefined,
              onPress: () => updateQuery({ type: 'setPending', pending: undefined }),
            },
            {
              title: t('filter.pending'),
              icon: 'hourglass',
              selected: query.pending === true,
              onPress: () => updateQuery({ type: 'setPending', pending: true }),
            },
            {
              title: t('filter.notPending'),
              icon: 'checkCircle',
              selected: query.pending === false,
              onPress: () => updateQuery({ type: 'setPending', pending: false }),
            },
          ]}
        />
      </View>
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
          paddingBottom: 48,
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
          gap: 8,
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
      maxWidth={550}
      maxHeight={700}
    >
      <FilterSelector />
    </ModalScreen>
  )
}
