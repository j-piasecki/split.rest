import ModalScreen from '@components/ModalScreen'
import { SegmentedButton } from '@components/SegmentedButton'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

export default function AppearanceScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useModalScreenInsets()

  return (
    <ModalScreen
      returnPath='/profile'
      title={t('screenName.profile.appearance')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          paddingBottom: insets.bottom + 16,
          paddingTop: insets.top + 16,
          gap: 24,
        }}
      >
        <View style={{ gap: 16 }}>
          <SegmentedButton
            style={{ alignSelf: 'stretch' }}
            items={[
              {
                title: t('settings.theme.light'),
                icon: 'lightTheme',
                selected: theme.userSelectedTheme === 'light',
                onPress: () => theme.setTheme('light'),
              },
              {
                title: t('settings.theme.dark'),
                icon: 'darkTheme',
                selected: theme.userSelectedTheme === 'dark',
                onPress: () => theme.setTheme('dark'),
              },
              {
                title: t('settings.theme.system'),
                icon: 'systemTheme',
                selected: theme.userSelectedTheme === null,
                onPress: () => theme.setTheme(null),
              },
            ]}
          />
          {theme.isMaterialYouSupported() && (
            <SegmentedButton
              items={[
                {
                  title: t('settings.theme.defaultColors'),
                  icon: 'colors',
                  selected: !theme.shouldUseMaterialYou,
                  onPress: () => theme.setShouldUseMaterialYou(false),
                },
                {
                  title: t('settings.theme.materialYouColors'),
                  icon: 'palette',
                  selected: theme.shouldUseMaterialYou,
                  onPress: () => theme.setShouldUseMaterialYou(true),
                },
              ]}
            />
          )}
        </View>
      </ScrollView>
    </ModalScreen>
  )
}
