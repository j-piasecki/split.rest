import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import { ProfilePicture } from '@components/ProfilePicture'
import { ShimmerPlaceholder } from '@components/ShimmerPlaceholder'
import { Text } from '@components/Text'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useRouletteQuery } from '@hooks/useRouletteQuery'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { getBalanceColor } from '@utils/getBalanceColor'
import { beginNewSplit } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, LayoutRectangle, Platform, ScrollView, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { TranslatableError, UserWithDisplayName } from 'shared'

interface RouletteProps {
  groupId: number
  setQuery: (result: PersonEntry[]) => void
  user: UserWithDisplayName
}

function Roulette({ groupId, setQuery, user }: RouletteProps) {
  const insets = useModalScreenInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const paneLayout = useRef<LayoutRectangle | null>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(groupId)
  const [entries, setEntries] = useState<PersonEntry[]>([
    { user: user, entry: user.email ?? '' },
    { entry: '' },
  ])
  const [error, setError] = useTranslatedError()
  const [waiting, setWaiting] = useState(false)

  async function addAllMembers() {
    if (waiting) {
      return
    }

    setWaiting(true)
    const allMembers = await getAllGroupMembers(groupId)
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
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps='handled'
      >
        <Pane
          icon='group'
          title={t('splitInfo.participants')}
          textLocation='start'
          containerStyle={{
            gap: 16,
            padding: 16,
            paddingTop: 8,
          }}
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
          <Form autofocus onSubmit={submit}>
            <PeoplePicker
              groupId={groupId}
              entries={entries}
              onEntriesChange={setEntries}
              parentLayout={paneLayout}
              scrollRef={scrollViewRef}
            />
          </Form>
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
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
  setQuery: (result: PersonEntry[] | null) => void
}

function Result({ query, groupId, setQuery }: ResultProps) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { data: permissions } = useGroupPermissions(groupId)
  const { t } = useTranslation()
  const { error, result, finished } = useRouletteQuery(groupId, query)

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
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
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
        }}
      >
        <Pane
          containerStyle={{ padding: 16, paddingTop: 4 }}
          icon='listNumbered'
          title={t('roulette.result')}
          textLocation='start'
        >
          {result.map((user, index) => {
            const balanceNum = parseFloat(user.change ?? '')
            const balanceColor = getBalanceColor(balanceNum, theme)

            return (
              <Animated.View
                key={user.id}
                layout={
                  Platform.OS !== 'web'
                    ? LinearTransition.springify()
                        .damping(100)
                        .stiffness(200)
                        .delay(50 * index)
                    : undefined
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: index === result.length - 1 ? 0 : 1,
                  borderColor: theme.colors.outlineVariant,
                  paddingVertical: 16,
                  gap: 8,
                }}
              >
                <ProfilePicture userId={user.id} size={28} />
                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ fontSize: 18, fontWeight: 800, color: theme.colors.onSurface }}>
                    {user.displayName ?? user.name}
                  </Text>

                  {user.displayName && (
                    <Text style={{ fontSize: 10, fontWeight: 600, color: theme.colors.outline }}>
                      {user.name}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }} />

                <ShimmerPlaceholder argument={user.change} shimmerStyle={{ width: 64, height: 24 }}>
                  <Text style={{ fontSize: 18, color: balanceColor }}>{user.change}</Text>
                </ShimmerPlaceholder>
              </Animated.View>
            )
          })}
        </Pane>
      </ScrollView>

      {permissions?.canCreateSplits() && (
        <Button
          leftIcon='split'
          title={t('roulette.createSplit')}
          onPress={() => {
            beginNewSplit({
              participants: result.map((user) => ({ user: user })),
              paidById: result[0].id,
            })
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
  const { data: permissions } = useGroupPermissions(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)
  const [query, setQuery] = useState<PersonEntry[] | null>(null)

  const canAccessRoulette = permissions?.canAccessRoulette() ?? false

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.roulette')} maxWidth={500}>
      {!memberInfo && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {memberInfo && (
        <>
          {!canAccessRoulette && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: theme.colors.outline, fontSize: 20, textAlign: 'center' }}>
                {t('api.insufficientPermissions.group.accessRoulette')}
              </Text>
            </View>
          )}
          {canAccessRoulette && query === null && (
            <Roulette groupId={Number(id)} setQuery={setQuery} user={memberInfo} />
          )}
          {canAccessRoulette && query !== null && (
            <Result groupId={Number(id)} query={query} setQuery={setQuery} />
          )}
        </>
      )}
    </ModalScreen>
  )
}
