import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

function FilterSelector() {
  const router = useRouter()
  const insets = useModalScreenInsets()
  const { id: groupId } = useLocalSearchParams()
  const { t } = useTranslation()

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(`/group/${groupId}`)
    }
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: 24,
          justifyContent: 'space-between',
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
          paddingTop: insets.top + 16,
        }}
        keyboardShouldPersistTaps='handled'
      ></ScrollView>

      <View
        style={{
          gap: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}
      >
        <Button
          leftIcon='erase'
          pressableStyle={{ paddingHorizontal: 4 }}
          destructive
          onPress={goBack}
        />

        <Button
          leftIcon='check'
          title={t('filter.apply')}
          style={{ flex: 1 }}
          onPress={goBack}
        />
      </View>
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.filter')}
      maxWidth={400}
      maxHeight={600}
    >
      <FilterSelector />
    </ModalScreen>
  )
}
