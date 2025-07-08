import { SplitEntry } from './SplitEntry'
import { FormActionType, FormData } from './formData'
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
}

export function EntriesPane({
  formState,
  updateForm,
  groupInfo,
  scrollRef,
  showPayerSelector,
  showAddAllMembers = true,
  setMembers,
}: SplitEntriesPaneProps) {
  const { t } = useTranslation()
  const layout = useRef<LayoutRectangle | null>(null)

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
      <Form>
        {formState.entries.map((entry, index) => (
          <SplitEntry
            key={index}
            scrollRef={scrollRef}
            groupId={groupInfo.id}
            index={index}
            formState={formState}
            updateForm={updateForm}
            parentLayout={layout}
            focusIndex={index * 2}
            showPayerSelector={showPayerSelector}
          />
        ))}
      </Form>
    </Pane>
  )
}
