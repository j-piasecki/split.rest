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
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useRouletteQuery } from '@hooks/useRouletteQuery'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, LayoutRectangle, Platform, ScrollView, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { CurrencyUtils, GroupUserInfo, Member, SplitMethod, TranslatableError } from 'shared'

const RouletteAllowedSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.Shares,
  SplitMethod.BalanceChanges,
]

interface RouletteProps {
  groupInfo: GroupUserInfo
  setQuery: (result: PersonEntry[]) => void
  user: Member
}

function Roulette({ groupInfo, setQuery, user }: RouletteProps) {
  const insets = useModalScreenInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const paneLayout = useRef<LayoutRectangle | null>(null)
  const selectablePeoplePickerRef = useRef<SelectablePeoplePickerRef>(null)
  const { t } = useTranslation()
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

  const submit = useCallback(async () => {
    setError(null)
    const filledUsers = entries.filter((entry) => entry.user !== undefined)

    if (filledUsers.length < 2) {
      setError(new TranslatableError('roulette.youNeedToAddAtLeastTwoUsers'))
      return
    }

    setQuery(filledUsers)
  }, [entries, setError, setQuery])

  useEffect(() => {
    if (entries.length === 2 && groupInfo.memberCount === entries.length) {
      submit()
    }
  }, [entries, groupInfo.memberCount, submit])

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
          collapsible={groupInfo.permissions.canReadMembers()}
          collapsed={false}
          collapseIcon='addAllMembers'
          onCollapseChange={() => {
            if (groupInfo.permissions.canReadMembers()) {
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
  groupInfo: GroupUserInfo
  setQuery: (result: PersonEntry[] | null) => void
}

function Result({ query, groupInfo, setQuery }: ResultProps) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const { error, result, finished } = useRouletteQuery(groupInfo.id, query)

  const canSplit = groupInfo.allowedSplitMethods.some((method) =>
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
            const balanceNum = parseFloat(user.balance ?? '')
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
                  <ProfilePicture user={user} size={28} />
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontWeight: 700,
                        color: theme.colors.onSurface,
                      }}
                    >
                      {user.displayName ?? user.name}
                    </Text>

                    {user.displayName && (
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 12, fontWeight: 600, color: theme.colors.outline }}
                      >
                        {user.name}
                      </Text>
                    )}
                  </View>

                  <ShimmerPlaceholder
                    argument={user.maybeBalance}
                    shimmerStyle={{ width: 64, height: 24 }}
                  >
                    <Text style={{ fontSize: 18, color: balanceColor }}>
                      {CurrencyUtils.format(balanceNum, groupInfo.currency, true)}
                    </Text>
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

      {groupInfo.permissions.canCreateSplits() && canSplit && (
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

            router.navigate(`/group/${groupInfo.id}/addSplit`)
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
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)
  const [query, setQuery] = useState<PersonEntry[] | null>(null)

  const canAccessRoulette = groupInfo?.permissions?.canAccessRoulette?.() ?? false

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.roulette')} maxWidth={500}>
      {(!memberInfo || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {memberInfo && groupInfo && (
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
            <Result groupInfo={groupInfo} query={query} setQuery={setQuery} />
          )}
        </>
      )}
    </ModalScreen>
  )
}
