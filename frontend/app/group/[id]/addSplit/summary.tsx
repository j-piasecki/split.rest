import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { SplitInfo } from '@components/SplitInfo'
import { Text } from '@components/Text'
import { useCreateSplit } from '@hooks/database/useCreateSplit'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useTranslatedError } from '@hooks/useTranslatedError'
import { useTheme } from '@styling/theme'
import { getSplitCreationContext } from '@utils/splitCreationContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { GroupInfo, SplitWithUsers } from 'shared'

function Content({ groupInfo, split }: { groupInfo: GroupInfo; split: SplitWithUsers }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const [error, setError] = useTranslatedError()
  const { data: permissions } = useGroupPermissions(groupInfo.id)
  const { mutateAsync: createSplit, isPending } = useCreateSplit()

  function save() {
    createSplit({
      groupId: groupInfo.id,
      paidBy: split.paidById,
      title: split.title,
      total: split.total,
      timestamp: split.timestamp,
      balances: split.users.map((user) => ({
        id: user.id,
        change: user.change,
      })),
    })
      .then(() => {
        router.dismissTo(`/group/${groupInfo.id}`)
      })
      .catch(setError)
  }

  return (
    <View style={{ flex: 1 }}>
      <SplitInfo groupInfo={groupInfo} splitInfo={split} />

      <View style={{ gap: 16, paddingHorizontal: 16 }}>
        {error && (
          <Text
            style={{
              color: theme.colors.error,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {error}
          </Text>
        )}
        {permissions?.canCreateSplits() && (
          <Button leftIcon='save' title={t('form.save')} isLoading={isPending} onPress={save} />
        )}
        {!permissions?.canCreateSplits() && (
          <Text
            style={{
              color: theme.colors.error,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {t('api.insufficientPermissions.group.createSplit')}
          </Text>
        )}
      </View>
    </View>
  )
}

export default function Modal() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams()
  const theme = useTheme()
  const router = useRouter()
  const { data: groupInfo } = useGroupInfo(Number(id))
  const [error, setError] = useTranslatedError()
  const [split, setSplit] = useState<SplitWithUsers | null>(null)

  useEffect(() => {
    getSplitCreationContext()
      .buildSplitPreview()
      .then((split) => {
        setSplit(split)
      })
      .catch(setError)
  }, [setError])

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.splitSummary')}
      maxWidth={500}
      opaque={false}
    >
      {error && (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                color: theme.colors.error,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {error}
            </Text>
          </View>
          <Button
            leftIcon='chevronBack'
            title={t('form.back')}
            onPress={() => {
              if (router.canGoBack()) {
                router.back()
              } else {
                router.replace(`/group/${id}`)
              }
            }}
          />
        </View>
      )}
      {!groupInfo && !error && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.onSurface} />
        </View>
      )}
      {!error && groupInfo && split && <Content groupInfo={groupInfo} split={split} />}
    </ModalScreen>
  )
}
