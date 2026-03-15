import { Button } from '@components/Button'
import { ConfirmationModal } from '@components/ConfirmationModal'
import ModalScreen from '@components/ModalScreen'
import { Selector } from '@components/Selector'
import { useSnack } from '@components/SnackBar'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupMembers } from '@hooks/database/useGroupMembers'
import { useSettleUpGroup } from '@hooks/database/useSettleUpGroup'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { HapticFeedback } from '@utils/hapticFeedback'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { GroupUserInfo } from 'shared'

enum SettleUpOption {
  Personal = 'personal',
  Group = 'group',
}

function SelectorContent({ groupInfo }: { groupInfo: GroupUserInfo }) {
  const theme = useTheme()
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { t } = useTranslation()
  const snack = useSnack()
  const [selectedOption, setSelectedOption] = useState<SettleUpOption>(SettleUpOption.Personal)
  const [settleUpGroupModalVisible, setSettleUpGroupModalVisible] = useState(false)
  const { mutateAsync: settleUpGroup, isPending: isSettlingUpGroup } = useSettleUpGroup(
    groupInfo.id
  )

  const { members } = useGroupMembers(groupInfo.id, true)
  const canSettleUpGroup = members.length > 0 && Number(members[0].balance) !== 0

  const handleNext = () => {
    if (selectedOption === SettleUpOption.Personal) {
      router.navigate(`/group/${groupInfo.id}/settleUp/confirm`)
    } else {
      setSettleUpGroupModalVisible(true)
    }
  }

  const onConfirmSettleUpGroup = async () => {
    setSettleUpGroupModalVisible(false)
    try {
      await settleUpGroup()
      snack.show({ message: t('groupSettings.settleUpGroupSuccess') })
      HapticFeedback.confirm()
      router.dismissTo(`/group/${groupInfo.id}`)
    } catch (_e) {
      HapticFeedback.reject()
    }
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          gap: 16,
        }}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            paddingHorizontal: 12,
            color: theme.colors.onSurface,
            fontSize: 26,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {t('groupInfo.settleUp.options.title')}
        </Text>

        <Selector>
          <Selector.Item
            title={t('groupInfo.settleUp.options.personal.title')}
            description={t('groupInfo.settleUp.options.personal.description')}
            icon='user'
            selected={selectedOption === SettleUpOption.Personal}
            onSelect={() => setSelectedOption(SettleUpOption.Personal)}
            startExpanded={true}
            collapsible={false}
          />
          <Selector.Item
            title={t('groupInfo.settleUp.options.group.title')}
            description={t('groupInfo.settleUp.options.group.description')}
            icon='members'
            selected={selectedOption === SettleUpOption.Group}
            onSelect={() => setSelectedOption(SettleUpOption.Group)}
            startExpanded={true}
            disabled={!canSettleUpGroup}
            collapsible={false}
          />
        </Selector>
      </ScrollView>

      <View style={{ paddingLeft: insets.left + 12, paddingRight: insets.right + 12, gap: 8 }}>
        <Button
          title={t('groupInfo.settleUp.options.continue')}
          leftIcon='balance'
          onPress={handleNext}
          isLoading={isSettlingUpGroup}
        />
      </View>

      <ConfirmationModal
        visible={settleUpGroupModalVisible}
        onClose={() => setSettleUpGroupModalVisible(false)}
        onConfirm={onConfirmSettleUpGroup}
        title='groupSettings.settleUpGroupConfirmationText'
        message='groupSettings.settleUpGroupConfirmationMessage'
        cancelText='groupSettings.settleUpGroupCancel'
        cancelIcon='close'
        confirmText='groupSettings.settleUpGroupConfirm'
        confirmIcon='check'
      />
    </View>
  )
}

export default function SettleUpMethod() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const theme = useTheme()

  return (
    <ModalScreen returnPath={`/group/${id}`} title={t('screenName.settleUpMethod')}>
      {!groupInfo && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
      )}
      {groupInfo && <SelectorContent groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
