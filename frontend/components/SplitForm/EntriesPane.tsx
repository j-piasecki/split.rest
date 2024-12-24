import { SplitEntry } from './SplitEntry'
import { FormActionType, FormData } from './formData'
import { Pane } from '@components/Pane'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutRectangle, ScrollView } from 'react-native'
import { GroupInfo } from 'shared'

interface SplitEntriesPaneProps {
  formState: FormData
  updateForm: React.Dispatch<FormActionType>
  groupInfo: GroupInfo
  scrollRef?: React.RefObject<ScrollView>
}

export function EntriesPane({
  formState,
  updateForm,
  groupInfo,
  scrollRef,
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
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        overflow: 'visible',
      }}
    >
      {formState.entries.map((entry, index) => (
        <React.Fragment key={index}>
          <SplitEntry
            scrollRef={scrollRef}
            groupId={groupInfo.id}
            index={index}
            formState={formState}
            updateForm={updateForm}
            parentLayout={layout}
          />
        </React.Fragment>
      ))}
    </Pane>
  )
}
