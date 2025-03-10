/* eslint-disable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import * as MOCKS from '@utils/indexMocks'
import { Image } from 'expo-image'
import { Link, Redirect, useRouter } from 'expo-router'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  Platform,
  Pressable,
  ScrollView,
  TransformsStyle,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function StoreButton(props: { src: string; href: string }) {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.navigate(props.href)}>
      <Image
        source={props.src}
        style={{ width: 135, height: 40 }}
        contentFit='contain'
        contentPosition='right center'
      />
    </Pressable>
  )
}

// This screen shouldn't be acccessible on mobile

export default function Screen() {
  const user = useAuth(false)

  return (
    <>
      {Platform.OS !== 'web' && <Redirect href='/login' withAnchor />}
      {Platform.OS === 'web' && user && <Redirect href='/home' withAnchor />}
      {Platform.OS === 'web' && <HomePage />}
    </>
  )
}

enum TriangleOrientation {
  TopRight,
  BottomRight,
  BottomLeft,
  TopLeft,
}

interface TriangleProps {
  width: number
  height: number
  color: string
  top?: number
  maxHeight?: number
  orientation?: TriangleOrientation
}

function Triangle({
  width,
  height,
  color,
  top = 0,
  maxHeight = Number.MAX_SAFE_INTEGER,
  orientation = TriangleOrientation.TopRight,
}: TriangleProps) {
  let transform: TransformsStyle['transform'] = []

  switch (orientation) {
    case TriangleOrientation.TopRight:
      // no transform needed
      break
    case TriangleOrientation.BottomRight:
      transform = [{ scaleY: -1 }]
      break
    case TriangleOrientation.BottomLeft:
      transform = [{ rotate: '180deg' }]
      break
    case TriangleOrientation.TopLeft:
      transform = [{ rotate: '180deg' }, { scaleY: -1 }]
      break
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: top,
        left: 0,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: Math.min(height, maxHeight),
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: width,
        borderTopColor: color,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        transform: transform,
      }}
    />
  )
}

function Landing() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()
  const displayClass = useDisplayClass()

  const mediumScreenOrLess = displayClass <= DisplayClass.Medium

  return (
    <View
      style={{
        width: '100%',
        minHeight: (height * 2) / 3 + insets.top,
        paddingTop: 32,
        paddingHorizontal: mediumScreenOrLess ? 16 : 48,
        alignItems: 'center',
      }}
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
      <Triangle
        width={width}
        height={(height * 2) / 3}
        maxHeight={(1600 * 2) / 3}
        color={theme.colors.primaryContainer}
        top={insets.top}
        orientation={TriangleOrientation.TopRight}
      />

      <View
        style={{
          width: '100%',
          maxWidth: 1400,
          gap: 24,
          flexDirection: mediumScreenOrLess ? 'column' : 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 40, fontWeight: 700, color: theme.colors.primary }}>
              {t('appName')}
              <Text style={{ color: theme.colors.outline }}>.rest</Text>
            </Text>
            <Image
              source={require('@assets/icon.svg')}
              style={{ width: 160, height: 160 }}
              tintColor={theme.colors.primary}
            />
          </View>

          <View
            style={{
              flex: 1,
              maxWidth: mediumScreenOrLess ? undefined : 600,
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 48,
              paddingBottom: 16,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 24,
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
            <Text
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: theme.colors.onSurface,
                textAlign: 'center',
              }}
            >
              {t('index.tagLine')}
            </Text>

            <View style={{ marginTop: 16 }}>
              <Button
                title={t('signIn')}
                onPress={() => {
                  router.navigate('/login')
                }}
                leftIcon='login'
                style={{ marginTop: 16, marginHorizontal: 16 }}
              />

              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  gap: 16,
                  alignItems: 'center',
                  marginVertical: 12,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outline }} />
                <Text style={{ color: theme.colors.outline }}>{t('index.or')}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outline }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
                <StoreButton
                  src='./google_play.png'
                  href='https://play.google.com/store/apps/details?id=rest.split.app'
                />
                <StoreButton
                  src='./app_store.png'
                  href='https://apps.apple.com/us/app/split-rest/id6740080711?platform=iphone'
                />
              </View>
            </View>
          </View>
        </View>

        <Image
          source={MOCKS.MOCK_GROUP}
          style={{ width: '100%', maxWidth: 400, height: 'auto', aspectRatio: 0.5 }}
        />
      </View>
    </View>
  )
}

function Footer() {
  const theme = useTheme()
  const displayClass = useDisplayClass()
  const { t } = useTranslation()

  const expandedScreenOrLess = displayClass <= DisplayClass.Expanded

  return (
    <View
      style={{
        width: '100%',
        flexGrow: 1,
        marginTop: 32,
        paddingVertical: 128,
        paddingHorizontal: expandedScreenOrLess ? 16 : 128,
        backgroundColor: theme.colors.surfaceContainer,
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1, width: '100%', maxWidth: 1400, justifyContent: 'center', gap: 16 }}>
        <View
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            alignItems: expandedScreenOrLess ? 'center' : undefined,
            gap: 6,
          }}
        >
          <Link
            href='/privacyPolicy'
            style={{ color: theme.colors.onSurface, fontSize: 14, fontWeight: 400 }}
          >
            {t('index.privacyPolicy')}
          </Link>
          <Link
            href='mailto:contact@split.rest'
            style={{ color: theme.colors.onSurface, fontSize: 14, fontWeight: 400 }}
          >
            {t('index.contact')}
          </Link>
        </View>

        <View
          style={[
            { gap: 24, alignItems: 'center' },
            expandedScreenOrLess
              ? { flexDirection: 'column-reverse' }
              : { flexDirection: 'row', justifyContent: 'space-between' },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Image
              source={require('@assets/icon.svg')}
              style={{ width: 48, height: 48 }}
              tintColor={theme.colors.primary}
            />
            <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: 400 }}>
              © {new Date().getFullYear()} Split.rest
            </Text>
          </View>

          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: 18,
              fontWeight: 400,
              textAlign: 'center',
            }}
          >
            Made in Poland 🇵🇱 with ❤️
          </Text>
        </View>
      </View>
    </View>
  )
}

interface SectionProps {
  backgroundLocation?: 'left' | 'right'
  backgroundColor: string
  mockImage: any
  text: string
  big?: boolean
}

function Section({
  backgroundLocation = 'left',
  big = false,
  backgroundColor,
  mockImage,
  text,
}: SectionProps) {
  const theme = useTheme()
  const { width, height } = useWindowDimensions()
  const displayClass = useDisplayClass()

  const mediumScreenOrLess = displayClass <= DisplayClass.Medium

  return (
    <View
      style={{
        width: '100%',
        minHeight: (height * 4) / 3,
        paddingTop: 32,
        paddingHorizontal: mediumScreenOrLess ? 16 : 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Triangle
        width={width}
        height={(height * 2) / 3}
        maxHeight={(1600 * 2) / 3}
        color={backgroundColor}
        top={0}
        orientation={
          backgroundLocation === 'left'
            ? TriangleOrientation.BottomLeft
            : TriangleOrientation.BottomRight
        }
      />
      <Triangle
        width={width}
        height={(height * 2) / 3}
        maxHeight={(1600 * 2) / 3}
        color={backgroundColor}
        top={(height * 2) / 3 - 1}
        orientation={
          backgroundLocation === 'left' ? TriangleOrientation.TopRight : TriangleOrientation.TopLeft
        }
      />

      <View
        style={{
          width: '100%',
          maxWidth: 1400,
          gap: 24,
          flexDirection: mediumScreenOrLess
            ? 'column'
            : backgroundLocation === 'left'
              ? 'row'
              : 'row-reverse',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            maxWidth: 500,
            transform: [{ translateY: mediumScreenOrLess ? 0 : -140 }],
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: theme.colors.onSurface,
              textAlign: 'center',
            }}
          >
            {text}
          </Text>
        </View>

        <Image
          source={mockImage}
          style={[
            { width: '100%', height: 'auto' },
            big ? { maxWidth: 800, aspectRatio: 0.69 } : { maxWidth: 400, aspectRatio: 0.5 },
          ]}
          contentFit='contain'
        />
      </View>
    </View>
  )
}

function HomePage() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

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
      <Landing />
      <Section
        backgroundLocation='right'
        backgroundColor={theme.colors.secondaryContainer}
        mockImage={MOCKS.MOCK_GROUP_LIGHT}
        text={t('index.mockLightMode')}
      />
      <Section
        backgroundLocation='left'
        backgroundColor={theme.colors.primaryContainer}
        mockImage={MOCKS.MOCK_SPLIT}
        text={t('index.mockSplit')}
      />
      <Section
        backgroundLocation='right'
        backgroundColor={theme.colors.secondaryContainer}
        mockImage={MOCKS.MOCK_SPLIT_TYPES}
        text={t('index.mockSplitTypes')}
      />
      <Section
        backgroundLocation='left'
        backgroundColor={theme.colors.primaryContainer}
        mockImage={MOCKS.MOCK_ROULETTE}
        text={t('index.mockRoulette')}
      />
      <Section
        backgroundLocation='right'
        backgroundColor={theme.colors.secondaryContainer}
        mockImage={MOCKS.MOCK_SETTLEUP}
        text={t('index.mockSettleUp')}
      />
      <Section
        backgroundLocation='left'
        backgroundColor={theme.colors.primaryContainer}
        mockImage={MOCKS.MOCK_MEMBERS}
        text={t('index.mockMembers')}
      />
      <Section
        backgroundLocation='right'
        backgroundColor={theme.colors.secondaryContainer}
        mockImage={MOCKS.MOCK_BIG}
        text={t('index.mockBig')}
        big
      />
      <Footer />
    </ScrollView>
  )
}
