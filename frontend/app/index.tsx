/* eslint-disable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { Image } from 'expo-image'
import { Redirect, useRouter } from 'expo-router'
import { Trans, useTranslation } from 'react-i18next'
import { Platform, ScrollView, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const mock1 = require('@assets/mocks/mock1.png')
const mock2 = require('@assets/mocks/mock2.png')
const mock3 = require('@assets/mocks/mock3.png')
const mock4 = require('@assets/mocks/mock4.png')
const mock5 = require('@assets/mocks/mock5.png')

interface CardProps {
  title: string
  description: string
  image: any
  reversed?: boolean
}

function Card({ title, description, image, reversed }: CardProps) {
  const theme = useTheme()
  const isColumn = useWindowDimensions().width < 900

  return (
    <View
      style={{
        width: '100%',
        flexDirection: isColumn ? 'column' : reversed ? 'row-reverse' : 'row',
        gap: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={image}
        style={{ maxWidth: 500, width: '100%', aspectRatio: 1 }}
        contentFit='contain'
      />
      <View
        style={{
          flex: 1,
          height: isColumn ? 'auto' : '100%',
          paddingVertical: isColumn ? 0 : 24,
          paddingLeft: !isColumn && reversed ? 48 : 0,
          paddingRight: !isColumn && !reversed ? 48 : 0,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontSize: 30, fontWeight: 600 }}>
          {title}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 24, fontWeight: 600 }}>
          {description}
        </Text>
      </View>
    </View>
  )
}

// This screen shouldn't be acccessible on mobile

export default function Screen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const user = useAuth(false)
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme.colors.surface,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {Platform.OS !== 'web' && <Redirect href='/login' withAnchor />}
      {Platform.OS === 'web' && user && <Redirect href='/home' withAnchor />}

      <View
        style={{ width: width, height: height / 2, justifyContent: 'center', alignItems: 'center' }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: theme.colors.primaryContainer,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top,
            left: 0,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderTopWidth: height / 2,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            borderLeftWidth: width,
            borderTopColor: theme.colors.primaryContainer,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
        />

        <View style={{ padding: 16, gap: 16, alignItems: 'center', width: '100%' }}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@assets/icon.svg')}
            style={{ width: 160, height: 160 }}
            tintColor={theme.colors.primary}
          />
          <View style={{ position: 'absolute', bottom: -176, alignItems: 'center', padding: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: theme.colors.primary }}>
              {t('appName')}
              <Text style={{ color: theme.colors.outlineVariant }}>.rest</Text>
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.colors.onSurface,
                textAlign: 'center',
              }}
            >
              <Trans
                i18nKey={'index.headline'}
                components={{ Styled: <Text style={{ color: theme.colors.primary }} /> }}
              />
            </Text>

            <Button
              title={t('signIn')}
              onPress={() => {
                router.navigate('/login')
              }}
              leftIcon='login'
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          width: '100%',
          marginTop: 64,
          maxWidth: 1280,
          alignSelf: 'center',
          padding: 24,
          gap: 16,
        }}
      >
        <Card
          title={t('index.mock1Header')}
          description={t('index.mock1Text')}
          image={mock1}
          reversed
        />
        <Card title={t('index.mock2Header')} description={t('index.mock2Text')} image={mock2} />
        <Card
          title={t('index.mock3Header')}
          description={t('index.mock3Text')}
          image={mock3}
          reversed
        />
        <Card title={t('index.mock4Header')} description={t('index.mock4Text')} image={mock4} />
        <Card
          title={t('index.mock5Header')}
          description={t('index.mock5Text')}
          image={mock5}
          reversed
        />
      </View>
    </ScrollView>
  )
}
