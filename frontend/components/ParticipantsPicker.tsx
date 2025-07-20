import { IconName } from './Icon'
import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import { Pane } from '@components/Pane'
import { PeoplePicker, PersonEntry } from '@components/PeoplePicker'
import {
  SelectablePeoplePicker,
  SelectablePeoplePickerRef,
} from '@components/SelectablePeoplePicker'
import { SuggestionsPane } from '@components/SplitForm/SuggestionsPane'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { UserWithValue } from '@utils/splitCreationContext'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, ScrollView, View } from 'react-native'
import { GroupUserInfo, TranslatableError, UserWithDisplayName } from 'shared'

function getInitialEntries(
  user: UserWithDisplayName,
  savedParticipants?: UserWithValue[],
  paidByIndex?: number,
  requiredPayer?: boolean
): PersonEntry[] {
  if (savedParticipants) {
    const result = savedParticipants.map(
      (participant, index): PersonEntry => ({
        user: participant.user,
        selected: requiredPayer ? index === paidByIndex : false,
        entry: participant.user?.email ?? '',
      })
    )

    result.push({ entry: '', selected: false })

    if (paidByIndex === undefined && requiredPayer) {
      result[0].selected = true
    }

    return result
  }

  return [{ user: user, entry: user.email ?? '', selected: !!requiredPayer }, { entry: '' }]
}

export function ParticipantsPicker({
  user,
  groupInfo,
  autofocus = false,
  onSubmit,
  savedParticipants,
  paidByIndex,
  buttonTitle,
  buttonRightIcon,
  buttonLeftIcon,
  buttonLoading,
  requiredPayer = true,
  error,
}: {
  user: UserWithDisplayName
  groupInfo: GroupUserInfo
  buttonTitle: string
  buttonRightIcon?: IconName
  buttonLeftIcon?: IconName
  buttonLoading?: boolean
  autofocus?: boolean
  onSubmit: (users: UserWithDisplayName[], payerId?: string) => void
  savedParticipants?: UserWithValue[]
  paidByIndex?: number
  requiredPayer?: boolean
  error?: string
}) {
  const insets = useModalScreenInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const paneLayout = useRef<LayoutRectangle | null>(null)
  const selectablePeoplePickerRef = useRef<SelectablePeoplePickerRef>(null)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(groupInfo.id, user.id)

  const [waiting, setWaiting] = useState(false)
  const [entries, setEntries] = useState<PersonEntry[]>(
    getInitialEntries(user, savedParticipants, paidByIndex, requiredPayer)
  )
  const [innerError, setInnerError] = useTranslatedError()

  const useSelectablePicker = groupInfo.memberCount <= 16

  function submit() {
    setInnerError(null)

    const userEntries = entries
      .filter((entry) => entry.user !== undefined)
      .map((entry) => ({
        user: entry.user!,
        selected: entry.selected,
      }))

    if (userEntries.length < 2) {
      setInnerError(new TranslatableError('splitValidation.atLeastTwoEntries'))
      return
    }

    const payerEntry = userEntries.find((entry) => entry.selected)
    if (!payerEntry && requiredPayer) {
      setInnerError(new TranslatableError('splitValidation.thePayerMustBeSelected'))
      return
    }

    const payer = payerEntry?.user
    if (!payer && requiredPayer) {
      setInnerError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    onSubmit(
      userEntries.map((entry) => entry.user),
      payer?.id
    )
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
              pickablePayer={requiredPayer}
            />
          ) : (
            <Form autofocus={autofocus} onSubmit={submit}>
              <PeoplePicker
                groupId={groupInfo.id}
                entries={entries}
                selectable={requiredPayer}
                onEntriesChange={(entries) => {
                  setEntries(entries)
                  setInnerError(null)
                }}
                parentLayout={paneLayout}
                scrollRef={scrollViewRef}
              />
            </Form>
          )}
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
        {(innerError || error) && <ErrorText>{error ?? innerError}</ErrorText>}
        <Button
          isLoading={buttonLoading ?? waiting}
          rightIcon={buttonRightIcon}
          leftIcon={buttonLeftIcon}
          title={buttonTitle}
          onPress={submit}
        />
      </View>
    </View>
  )
}
