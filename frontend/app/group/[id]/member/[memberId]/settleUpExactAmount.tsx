import { Button } from '@components/Button'
import { ErrorText } from '@components/ErrorText'
import { Form } from '@components/Form'
import { LargeTextInput } from '@components/LargeTextInput'
import ModalScreen from '@components/ModalScreen'
import { SegmentedButton } from '@components/SegmentedButton'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import currency from 'currency.js'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { CurrencyUtils, GroupUserInfo, LanguageTranslationKey } from 'shared'

function MemberScreen({ groupInfo }: { groupInfo: GroupUserInfo }) {
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const router = useRouter()
  const { t } = useTranslation()
  const { id: groupId, memberId } = useLocalSearchParams()

  const [amount, setAmount] = useState('')
  const [outgoing, setOutgoing] = useState(true)
  const [error, setError] = useState<LanguageTranslationKey | null>(null)

  if (!groupInfo.permissions.canSettleUp()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: 600 }}>
          {t('api.insufficientPermissions.group.settleUp')}
        </Text>
      </View>
    )
  }

  function submit() {
    if (amount.length === 0) {
      setError('settleUpExactAmount.amountRequired')
      return
    }

    const amountNumber = Number(amount)
    if (Number.isNaN(amountNumber)) {
      setError('settleUpExactAmount.amountMustBeNumber')
      return
    }

    if (amountNumber <= 0) {
      setError('settleUpExactAmount.amountMustBeGreaterThanZero')
      return
    }

    const amountToPass = outgoing ? `-${currency(amount).toString()}` : currency(amount).toString()

    router.replace(`/group/${groupId}/settleUp?withMembers=${memberId}&amounts=${amountToPass}`)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
        gap: 12,
        justifyContent: 'space-between',
      }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ gap: 12 }}>
        <Form onSubmit={submit} autofocus>
          <LargeTextInput
            placeholder={t('settleUpExactAmount.amount')}
            value={amount}
            onChangeText={(value) => {
              setAmount(value)
              setError(null)
            }}
            keyboardType='numeric'
            onBlur={() => {
              const amountNum = Number(amount)
              if (!Number.isNaN(amountNum) && amount.length > 0) {
                setAmount(CurrencyUtils.format(amountNum))
              }
            }}
          />

          <SegmentedButton
            items={[
              {
                title: t('settleUpExactAmount.outgoing'),
                selected: outgoing,
                icon: 'outgoing',
                onPress: () => {
                  setOutgoing(true)
                },
              },
              {
                title: t('settleUpExactAmount.incoming'),
                selected: !outgoing,
                icon: 'incoming',
                onPress: () => {
                  setOutgoing(false)
                },
              },
            ]}
          />
        </Form>
      </View>

      <View style={{ gap: 8 }}>
        {error && <ErrorText translationKey={error} />}
        <Button title={t('settleUpExactAmount.settleUp')} onPress={submit} />
      </View>
    </ScrollView>
  )
}

export default function MemberInfoScreenWrapper() {
  const user = useAuth()
  const theme = useTheme()
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: groupInfo } = useGroupInfo(Number(id))

  if (user === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface }} />
  }

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.settleUpExactAmount')}
      maxWidth={500}
      maxHeight={600}
    >
      {groupInfo && <MemberScreen groupInfo={groupInfo} />}
    </ModalScreen>
  )
}
