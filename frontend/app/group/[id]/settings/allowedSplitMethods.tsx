import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { SplitMethodSelector } from '@components/SplitMethodSelector'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSetGroupAllowedSplitMethodsMutation } from '@hooks/database/useSetGroupAllowedSplitMethods'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { AllSplitMethods } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupUserInfo, SplitMethod, validateAllowedSplitMethods } from 'shared'

function Form({
  info,
  groupInfo,
}: {
  info: GroupUserInfo
  groupInfo: GroupUserInfo
}) {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const [error, setError] = useTranslatedError()
  const [allowedSplitMethods, setAllowedSplitMethods] = useState<SplitMethod[]>(
    groupInfo.allowedSplitMethods
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
          title={t('form.save')}
          isLoading={isPending}
          onPress={() => {
            if (!groupInfo.permissions.canManageAllowedSplitMethods()) {
              setError(t('api.insufficientPermissions.group.manageAllowedSplitMethods'))
              return
            }

            const error = validateAllowedSplitMethods(allowedSplitMethods)
            if (error) {
              setError(t(error))
              return
            }

            setError(null)
            setGroupAllowedSplitMethods(allowedSplitMethods)
              .then(() => {
                if (router.canGoBack()) {
                  router.back()
                } else {
                  router.navigate(`/group/${info.id}/settings`)
                }
              })
              .catch(setError)
          }}
        />
      </View>
    </View>
  )
}

export default function Settings() {
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const { data: groupInfo } = useGroupInfo(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.splitMethods')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      {info && groupInfo && (
        <Form info={info} groupInfo={groupInfo} />
      )}

      {(!info || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.onSurface} />
        </View>
      )}
    </ModalScreen>
  )
}
