import { SplitEntry } from './SplitEntry'
import { FormActionType, FormData, SplitEntryData } from './formData'
import { Form } from '@components/Form'
import { Pane } from '@components/Pane'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, ScrollView } from 'react-native'
import { GroupUserInfo, UserWithDisplayName } from 'shared'

interface SplitEntriesPaneProps {
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  groupInfo: GroupUserInfo
  showPayerSelector: boolean
  scrollRef?: React.RefObject<ScrollView | null>
  showAddAllMembers?: boolean
  setMembers?: (fetchMembers: () => Promise<UserWithDisplayName[]>) => void
  showPayerEntry?: boolean
  filterSuggestions?: (suggestions: UserWithDisplayName[]) => UserWithDisplayName[]
}

function isPaidByUser(formState: FormData, entry: SplitEntryData) {
  return formState.entries[formState.paidByIndex]?.user?.id === entry.user?.id
}

export function EntriesPane({
  formState,
  updateForm,
  groupInfo,
  scrollRef,
  showPayerSelector,
  showAddAllMembers = true,
  setMembers,
  showPayerEntry = true,
  filterSuggestions,
}: SplitEntriesPaneProps) {
  const { t } = useTranslation()
  const layout = useRef<LayoutRectangle | null>(null)

  const entries = formState.entries.filter(
    (entry) => showPayerEntry || !isPaidByUser(formState, entry)
  )

  return (
    <Pane
      icon='group'
      title={t('splitInfo.participants')}
      textLocation='start'
      onLayout={(event) => {
        layout.current = event.nativeEvent.layout
      }}
      containerStyle={{
        // paddingBottom: 16,
        overflow: 'visible',
        backgroundColor: 'transparent',
      }}
      collapsible={showAddAllMembers}
      collapsed={false}
      collapseIcon='addAllMembers'
      onCollapseChange={() => {
        if (showAddAllMembers) {
          setMembers?.(async () => {
            return await getAllGroupMembers(groupInfo.id)
          })
        }
      }}
    >
      <Form autofocus>
        {entries.map((entry, index) => (
          <SplitEntry
            key={index}
            scrollRef={scrollRef}
            groupId={groupInfo.id}
            index={index}
            first={index === 0}
            last={index === entries.length - 1}
            formState={formState}
            entry={entry}
            paidByThis={isPaidByUser(formState, entry)}
            updateForm={updateForm}
            parentLayout={layout}
            focusIndex={index * 2}
            showPayerSelector={showPayerSelector}
            filterSuggestions={filterSuggestions}
          />
        ))}
      </Form>
    </Pane>
  )
}
