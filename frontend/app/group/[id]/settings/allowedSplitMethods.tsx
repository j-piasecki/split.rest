import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSettings } from '@hooks/database/useGroupSettings'
import { useSetGroupAllowedSplitMethodsMutation } from '@hooks/database/useSetGroupAllowedSplitMethods'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { GroupPermissions } from '@utils/GroupPermissions'
import { AllSplitMethods } from '@utils/splitCreationContext'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { GroupSettings, GroupUserInfo, SplitMethod } from 'shared'

function Form({
  info,
  permissions,
  settings,
}: {
  info: GroupUserInfo
  permissions: GroupPermissions
  settings: GroupSettings
}) {
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [allowedSplitMethods, setAllowedSplitMethods] = useState<SplitMethod[]>(
    settings.allowedSplitMethods
  )
  const { t } = useTranslation()
  const { mutateAsync: setGroupAllowedSplitMethods, isPending } =
    useSetGroupAllowedSplitMethodsMutation(info.id)

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
            allowedMethods={AllSplitMethods}
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
          isLoading={isPending}
          onPress={() => {
            if (!permissions.canManageAllowedSplitMethods()) {
              setError(t('api.insufficientPermissions.group.manageAllowedSplitMethods'))
              return
            }

            if (allowedSplitMethods.length === 0) {
              setError(t('groupValidation.atLeastOneSplitMethodMustBeAllowed'))
              return
            }

            setError(null)
            setGroupAllowedSplitMethods(allowedSplitMethods).catch(setError)
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
  const { data: settings } = useGroupSettings(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.splitMethods')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      {info && permissions && settings && (
        <Form info={info} permissions={permissions} settings={settings} />
      )}

      {(!info || !permissions || !settings) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={Colors.primary} />
        </View>
      )}
    </ModalScreen>
  )
}
