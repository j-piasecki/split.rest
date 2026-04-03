import ModalScreen from '@components/ModalScreen'
import { ParticipantsPicker } from '@components/ParticipantsPicker'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMemberInfo } from '@hooks/database/useGroupMemberInfo'
import { useSplitCreationFlow } from '@hooks/useSplitCreationFlow'
import { useAuth } from '@utils/auth'
import { SplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { navigateToNextScreen } = useSplitCreationFlow()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const { data: memberInfo } = useGroupMemberInfo(Number(id), user?.id)

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.splitParticipants')}>
      {memberInfo && groupInfo && (
        <ParticipantsPicker
          user={memberInfo}
          groupInfo={groupInfo}
          savedParticipants={SplitCreationContext.current.participants ?? undefined}
          buttonTitle={t('form.buttonNext')}
          buttonRightIcon='chevronForward'
          requiredPayer={false}
          onSubmit={(users) => {
            SplitCreationContext.current.setParticipants(users.map((user) => ({ user })))
            navigateToNextScreen()
          }}
        />
      )}
    </ModalScreen>
  )
}
