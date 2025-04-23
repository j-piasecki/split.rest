import Modal from '@components/ModalScreen'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function SettleUp() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()

  return (
    <Modal title={t('screenName.settleUp')} returnPath={`/group/${id}`}>
      {null}
    </Modal>
  )
}
