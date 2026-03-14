import ModalScreen from '@components/ModalScreen'
import { SegmentedButton } from '@components/SegmentedButton'
import { Text } from '@components/Text'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

export default function AppearanceScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useModalScreenInsets()

  return (
    <ModalScreen returnPath='/profile' title={t('screenName.profile.appearance')}>
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
        <View style={{ gap: 32 }}>
          <View style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: theme.colors.onSurface }}>
                {t('settings.theme.themeTitle')}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
                {t('settings.theme.themeDescription')}
              </Text>
            </View>
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
          </View>

          {theme.isMaterialYouSupported() && (
            <View style={{ gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: theme.colors.onSurface }}>
                  {t('settings.theme.colorsTitle')}
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
                  {t('settings.theme.colorsDescription')}
                </Text>
              </View>
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
            </View>
          )}
        </View>
      </ScrollView>
    </ModalScreen>
  )
}
