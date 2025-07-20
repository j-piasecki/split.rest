import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import {
  SelectablePeoplePicker,
  SelectablePeoplePickerRef,
} from '@components/SelectablePeoplePicker'
import { SuggestionsPane } from '@components/SplitForm/SuggestionsPane'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, ScrollView, View } from 'react-native'
import { GroupUserInfo, TranslatableError, UserWithDisplayName } from 'shared'

function getInitialEntries(user: UserWithDisplayName): PersonEntry[] {
  const savedParticipants = SplitCreationContext.current.participants

  if (savedParticipants) {
    const result = savedParticipants.map(
      (participant, index): PersonEntry => ({
        user: participant.user,
        selected: index === SplitCreationContext.current.paidByIndex,
        entry: participant.user?.email ?? '',
      })
    )

    result.push({ entry: '', selected: false })

    if (SplitCreationContext.current.paidByIndex === undefined) {
      result[0].selected = true
    }

    return result
  }

  return [{ user: user, entry: user.email ?? '', selected: true }, { entry: '' }]
}

function ParticipantsPicker({
  user,
  groupInfo,
}: {
  user: UserWithDisplayName
  groupInfo: GroupUserInfo
}) {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const paneLayout = useRef<LayoutRectangle | null>(null)
  const selectablePeoplePickerRef = useRef<SelectablePeoplePickerRef>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(groupInfo.id, user.id)

  const [waiting, setWaiting] = useState(false)
  const [entries, setEntries] = useState<PersonEntry[]>(getInitialEntries(user))
  const [error, setError] = useTranslatedError()

  const useSelectablePicker = groupInfo.memberCount <= 16

  function submit() {
    const userEntries = entries
      .filter((entry) => entry.user !== undefined)
      .map((entry) => ({
        user: entry.user!,
        selected: entry.selected,
      }))

    if (userEntries.length < 2) {
      setError(new TranslatableError('splitValidation.atLeastTwoEntries'))
      return
    }

    const payerEntry = userEntries.find((entry) => entry.selected)
    if (!payerEntry) {
      setError(new TranslatableError('splitValidation.thePayerMustBeSelected'))
      return
    }

    const payer = payerEntry?.user
    if (!payer) {
      setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    SplitCreationContext.current.setParticipants(userEntries.filter((entry) => entry.user))
    SplitCreationContext.current.setPaidById(payer.id)

    router.navigate(`/group/${groupInfo.id}/addSplit/summary`)
  }

  async function addAllMembers() {
    if (useSelectablePicker) {
      selectablePeoplePickerRef.current?.selectAll()
      return
    }

    if (waiting) {
      return
    }

    setWaiting(true)
    const members = await getAllGroupMembers(groupInfo.id)
    setEntries(
      members.map((member) => ({
        user: member,
        entry: member.email ?? '',
        selected: member.id === user.id,
      }))
    )
    setWaiting(false)
  }

  return (
    <View
      style={{
        flex: 1,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 128,
          paddingTop: insets.top + 16,
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
          onCollapseChange={permissions?.canReadMembers() ? addAllMembers : undefined}
        >
          {useSelectablePicker ? (
            <SelectablePeoplePicker
              groupId={groupInfo.id}
              shimmerCount={groupInfo.memberCount}
              onEntriesChange={setEntries}
              ref={selectablePeoplePickerRef}
              entries={entries}
              pickablePayer={true}
            />
          ) : (
            <Form autofocus={SplitCreationContext.current.participants === null} onSubmit={submit}>
              <PeoplePicker
                groupId={groupInfo.id}
                entries={entries}
                selectable
                onEntriesChange={(entries) => {
                  setEntries(entries)
                  setError(null)
                }}
                parentLayout={paneLayout}
                scrollRef={scrollViewRef}
              />
            </Form>
          )}
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <Button
          isLoading={waiting}
          rightIcon='chevronForward'
          title={t('form.buttonNext')}
          onPress={submit}
        />
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const user = useAuth()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitParticipants')}
      maxWidth={500}
      opaque={false}
      slideAnimation={false}
    >
      {memberInfo && groupInfo && <ParticipantsPicker user={memberInfo} groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
