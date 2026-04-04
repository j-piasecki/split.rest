import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import ModalScreen from '@components/ModalScreen'
import { Pane } from '@components/Pane'
import { SelectablePeoplePicker } from '@components/SelectablePeoplePicker'
import { SuggestionsPane } from '@components/SplitForm/SuggestionsPane'
import { TextInputUserPicker } from '@components/TextInputUserPicker'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useSplitCreationFlow } from '@hooks/useSplitCreationFlow'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupUserInfo, Member, TranslatableError } from 'shared'

function LenderPicker({ groupInfo, user }: { groupInfo: GroupUserInfo; user: Member }) {
  const { navigateToNextScreen } = useSplitCreationFlow()
  const insets = useModalScreenInsets()
  const theme = useTheme()
  const { t } = useTranslation()
  const [error, setError] = useTranslatedError()

  const initialLender = SplitCreationContext.current.participants?.[0]?.user ?? user
  const [selected, setSelected] = useState<Member | undefined>(initialLender)
  const [textPickerUser, setTextPickerUser] = useState<Member | undefined>(initialLender)

  const useSelectablePicker = groupInfo.memberCount <= 16

  function submit() {
    setError(null)

    const lender = useSelectablePicker ? selected : textPickerUser

    if (!lender) {
      setError(new TranslatableError('splitValidation.thePayerDataMustBeFilledIn'))
      return
    }

    SplitCreationContext.current.setPaidById(lender.id)
    SplitCreationContext.current.setParticipants([{ user: lender }])
    navigateToNextScreen()
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
            hiddenIds={textPickerUser ? [textPickerUser.id] : []}
            onSelect={(user) => {
              setTextPickerUser(user)
              setError(null)
            }}
          />
        )}

        <Pane
          icon='group'
          title={
            SplitCreationContext.current.isBorrow
              ? t('form.selectBorrower')
              : t('form.selectLender')
          }
          textLocation='start'
          containerStyle={{ backgroundColor: 'transparent', overflow: 'visible' }}
          style={{ overflow: 'visible' }}
        >
          {useSelectablePicker ? (
            <SelectablePeoplePicker
              groupId={groupInfo.id}
              shimmerCount={groupInfo.memberCount}
              multiselect={false}
              selected={selected}
              onSelectedChange={(member) => {
                setSelected(member)
                setError(null)
              }}
            />
          ) : (
            <Form onSubmit={submit}>
              <View
                style={{
                  backgroundColor: theme.colors.surfaceContainer,
                  paddingHorizontal: 12,
                  paddingTop: 8,
                  paddingBottom: 16,
                  zIndex: 1,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <TextInputUserPicker
                  groupId={groupInfo.id}
                  value={textPickerUser?.email ?? ''}
                  user={textPickerUser}
                  onSuggestionSelect={(user) => {
                    setTextPickerUser(user)
                    setError(null)
                  }}
                  onClearSelection={() => {
                    setTextPickerUser(undefined)
                  }}
                  onChangeText={() => {
                    setTextPickerUser(undefined)
                  }}
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </Form>
          )}
        </Pane>
      </ScrollView>

      <View style={{ gap: 8 }}>
        {error && <ErrorText>{error}</ErrorText>}
        <Button rightIcon='chevronForward' title={t('form.buttonNext')} onPress={submit} />
      </View>
    </View>
  )
}

export default function Modal() {
  const { user } = useAuth()
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t(
        SplitCreationContext.current.isBorrow ? 'screenName.borrowerStep' : 'screenName.lenderStep'
      )}
    >
      {(!memberInfo || !groupInfo) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {memberInfo && groupInfo && <LenderPicker groupInfo={groupInfo} user={memberInfo} />}
    </ModalScreen>
  )
}
