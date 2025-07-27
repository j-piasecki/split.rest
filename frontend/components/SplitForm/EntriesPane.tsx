import { SplitEntry } from './SplitEntry'
import { FormActionType, FormData, SplitEntryData } from './formData'
import { Form } from '@components/Form'
import { Pane } from '@components/Pane'
import { getAllGroupMembers } from '@database/getAllGroupMembers'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardTypeOptions, LayoutRectangle, ScrollView } from 'react-native'
import { GroupUserInfo, LanguageTranslationKey, UserWithDisplayName } from 'shared'

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
  balanceKeyboardType?: KeyboardTypeOptions
  amountPlaceholder: LanguageTranslationKey
  integersOnly?: boolean
}

function isPaidByUser(formState: FormData, entry: SplitEntryData) {
  const paidByEntry = formState.entries[formState.paidByIndex]

  if (paidByEntry === undefined) {
    return false
  }

  return paidByEntry.user?.id === entry.user?.id
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
  balanceKeyboardType,
  amountPlaceholder,
  integersOnly,
}: SplitEntriesPaneProps) {
  const { t } = useTranslation()
  const layout = useRef<LayoutRectangle | null>(null)

  // const entries = formState.entries.filter(
  //   (entry) => showPayerEntry || !isPaidByUser(formState, entry)
  // )

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
        {formState.entries.map((entry, index) => {
          if (!showPayerEntry && isPaidByUser(formState, entry)) {
            return null
          }

          return (
            <SplitEntry
              key={index}
              scrollRef={scrollRef}
              groupId={groupInfo.id}
              index={index}
              first={index === 0}
              last={index === formState.entries.length - 1}
              formState={formState}
              entry={entry}
              paidByThis={isPaidByUser(formState, entry)}
              updateForm={updateForm}
              parentLayout={layout}
              focusIndex={index * 2}
              showPayerSelector={showPayerSelector}
              filterSuggestions={filterSuggestions}
              balanceKeyboardType={balanceKeyboardType}
              amountPlaceholder={amountPlaceholder}
              integersOnly={integersOnly}
            />
          )
        })}
      </Form>
    </Pane>
  )
}
