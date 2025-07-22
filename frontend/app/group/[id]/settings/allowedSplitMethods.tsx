import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { GroupPermissions } from '@utils/GroupPermissions'
import { AllSplitMethods } from '@utils/splitCreationContext'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitMethod } from 'shared'

function Form({ info, permissions }: { info: GroupUserInfo; permissions: GroupPermissions }) {
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [allowedSplitMethods, setAllowedSplitMethods] = useState<SplitMethod[]>(AllSplitMethods)
  const { t } = useTranslation()

  // TODO: fetch allowed split methods from the server

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        <Pane
          icon='split'
          title={t('group.allowedSplitMethods')}
          textLocation='start'
          containerStyle={{ paddingHorizontal: 12, paddingBottom: 16, paddingTop: 12 }}
        >
          <SplitMethodSelector
            multiple
            startExpanded={false}
            displayedMethods={AllSplitMethods}
            allowedMethods={allowedSplitMethods}
            selectedMethods={allowedSplitMethods}
            onSelectionChange={setAllowedSplitMethods}
          />
        </Pane>
      </ScrollView>
      <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12, gap: 8 }}>
        {error && (
          <View style={{ marginTop: 8 }}>
            <ErrorText>{error}</ErrorText>
          </View>
        )}
        <Button
          title='Save'
          onPress={() => {
            if (!permissions.canManageAllowedSplitMethods()) {
              setError(t('api.insufficientPermissions.group.manageAllowedSplitMethods'))
              return
            }

            alert(`Setting allowed split methods for group ${info.id}, ${allowedSplitMethods}`)
          }}
        />
      </View>
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.splitMethods')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      {info && permissions && <Form info={info} permissions={permissions} />}
    </ModalScreen>
  )
}
