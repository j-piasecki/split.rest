import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { ProfilePicture } from '@components/ProfilePicture'
import {
  SelectablePeoplePicker,
  SelectablePeoplePickerRef,
} from '@components/SelectablePeoplePicker'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { SuggestionsPane } from '@components/SplitForm/SuggestionsPane'
import { Text } from '@components/Text'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSettings } from '@hooks/database/useGroupSettings'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useRouletteQuery } from '@hooks/useRouletteQuery'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, LayoutRectangle, Platform, ScrollView, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import {
  GroupSettings,
  GroupUserInfo,
  SplitMethod,
  TranslatableError,
  UserWithDisplayName,
} from 'shared'

const RouletteAllowedSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.Shares,
  SplitMethod.BalanceChanges,
]

interface RouletteProps {
  groupInfo: GroupUserInfo
  setQuery: (result: PersonEntry[]) => void
  user: UserWithDisplayName
}

function Roulette({ groupInfo, setQuery, user }: RouletteProps) {
  const insets = useModalScreenInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const paneLayout = useRef<LayoutRectangle | null>(null)
  const selectablePeoplePickerRef = useRef<SelectablePeoplePickerRef>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(groupInfo.id)
  const [entries, setEntries] = useState<PersonEntry[]>([
    { user: user, entry: user.email ?? '' },
    { entry: '' },
  ])
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)

  const useSelectablePicker = groupInfo.memberCount <= 16

  async function addAllMembers() {
    if (useSelectablePicker) {
      selectablePeoplePickerRef.current?.selectAll()
      return
    }

    if (waiting) {
      return
    }

    setWaiting(true)
    const allMembers = await getAllGroupMembers(groupInfo.id)
    const memberEntries = allMembers.map((member) => ({
      user: member,
      entry: member.email ?? '',
    }))
    setEntries(memberEntries)
    setWaiting(false)
  }

  async function submit() {
    setError(null)
    const filledUsers = entries.filter((entry) => entry.user !== undefined)

    if (filledUsers.length < 2) {
      setError(new TranslatableError('roulette.youNeedToAddAtLeastTwoUsers'))
      return
    }

    setQuery(filledUsers)
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 128,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          gap: 12,
        }}
        keyboardShouldPersistTaps='handled'
      >
        {!useSelectablePicker && (
          <SuggestionsPane
            groupInfo={groupInfo}
            hiddenIds={entries.map((entry) => entry.user?.id).filter((id) => id !== undefined)}
            onSelect={(user) => {
              setEntries([
                ...entries.filter((entry) => entry.user || entry.entry),
                { user, entry: user.email ?? '', selected: false },
                { entry: '' },
              ])
            }}
          />
        )}

        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{ backgroundColor: 'transparent', overflow: 'visible' }}
          onLayout={(e) => {
            paneLayout.current = e.nativeEvent.layout
          }}
          collapsible={permissions?.canReadMembers()}
          collapsed={false}
          collapseIcon='addAllMembers'
          onCollapseChange={() => {
            if (permissions?.canReadMembers()) {
              addAllMembers()
            }
          }}
        >
          {useSelectablePicker ? (
            <SelectablePeoplePicker
              groupId={groupInfo.id}
              shimmerCount={groupInfo.memberCount}
              onEntriesChange={setEntries}
              entries={entries}
              ref={selectablePeoplePickerRef}
            />
          ) : (
            <Form autofocus onSubmit={submit}>
              <PeoplePicker
                groupId={groupInfo.id}
                entries={entries}
                onEntriesChange={setEntries}
                parentLayout={paneLayout}
                scrollRef={scrollViewRef}
              />
            </Form>
          )}
        </Pane>
      </ScrollView>

      <View style={{ gap: 8, paddingLeft: insets.left + 12, paddingRight: insets.right + 12 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <Button
          isLoading={waiting}
          leftIcon='check'
          title={t('roulette.submit')}
          onPress={submit}
        />
      </View>
    </View>
  )
}

interface ResultProps {
  query: PersonEntry[]
  groupId: number
  settings: GroupSettings
  setQuery: (result: PersonEntry[] | null) => void
}

function Result({ query, groupId, settings, setQuery }: ResultProps) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { data: permissions } = useGroupPermissions(groupId)
  const { t } = useTranslation()
  const { error, result, finished } = useRouletteQuery(groupId, query)

  const canSplit = settings.allowedSplitMethods.some((method) =>
    RouletteAllowedSplitMethods.includes(method)
  )

  useEffect(() => {
    if (error) {
      alert(error)
      setQuery(null)
    }
  }, [error, setQuery])

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingBottom: 16,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <Pane
          containerStyle={{ paddingBottom: 8, backgroundColor: 'transparent' }}
          icon='listNumbered'
          title={t('roulette.result')}
          textLocation='start'
        >
          {result.map((user, index) => {
            const balanceNum = parseFloat(user.change ?? '')
            const balanceColor = getBalanceColor(balanceNum, theme)

            return (
              <React.Fragment key={user.id}>
                <Animated.View
                  layout={
                    Platform.OS !== 'web'
                      ? LinearTransition.springify()
                          .damping(100)
                          .stiffness(200)
                          .delay(50 * index)
                      : undefined
                  }
                  style={[
                    {
                      backgroundColor: theme.colors.surfaceContainer,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 4,
                      padding: 16,
                      gap: 8,
                    },
                    index === result.length - 1 && {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    },
                  ]}
                >
                  <ProfilePicture userId={user.id} size={28} />
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: theme.colors.onSurface }}>
                      {user.displayName ?? user.name}
                    </Text>

                    {user.displayName && (
                      <Text style={{ fontSize: 12, fontWeight: 600, color: theme.colors.outline }}>
                        {user.name}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }} />

                  <ShimmerPlaceholder
                    argument={user.change}
                    shimmerStyle={{ width: 64, height: 24 }}
                  >
                    <Text style={{ fontSize: 18, color: balanceColor }}>{user.change}</Text>
                  </ShimmerPlaceholder>
                </Animated.View>
                {index !== result.length - 1 && (
                  <View style={{ height: 2, backgroundColor: 'transparent', zIndex: -1 }} />
                )}
              </React.Fragment>
            )
          })}
        </Pane>
      </ScrollView>

      {permissions?.canCreateSplits() && canSplit && (
        <Button
          leftIcon='split'
          title={t('roulette.createSplit')}
          style={{ marginLeft: insets.left + 12, marginRight: insets.right + 12 }}
          onPress={() => {
            SplitCreationContext.create()
              .setAllowedSplitMethods(RouletteAllowedSplitMethods)
              .setParticipants(result.map((user) => ({ user: user })))
              .setPaidById(result[0].id)
              .begin()

            router.navigate(`/group/${groupId}/addSplit`)
          }}
          isLoading={!finished}
        />
      )}
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuth()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)
  const { data: settings } = useGroupSettings(Number(id))
  const [query, setQuery] = useState<PersonEntry[] | null>(null)

  const canAccessRoulette = permissions?.canAccessRoulette() ?? false

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.roulette')} maxWidth={500}>
      {(!memberInfo || !groupInfo || !settings) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {memberInfo && groupInfo && settings && (
        <>
          {!canAccessRoulette && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: theme.colors.outline, fontSize: 20, textAlign: 'center' }}>
                {t('api.insufficientPermissions.group.accessRoulette')}
              </Text>
            </View>
          )}
          {canAccessRoulette && query === null && (
            <Roulette groupInfo={groupInfo} setQuery={setQuery} user={memberInfo} />
          )}
          {canAccessRoulette && query !== null && (
            <Result groupId={Number(id)} settings={settings} query={query} setQuery={setQuery} />
          )}
        </>
      )}
    </ModalScreen>
  )
}
