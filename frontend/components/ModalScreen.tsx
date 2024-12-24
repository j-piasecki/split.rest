import { RoundIconButton } from './RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface FullscreenModalProps {
  goBack: () => void
  title: string
  children: React.ReactNode
  onLayout?: (event: LayoutChangeEvent) => void
}

function FullscreenModal({ children, title, goBack, onLayout }: FullscreenModalProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        gap: 8,
      }}
    >
      <View
        style={[
          {
            width: '100%',
            height: 56 + insets.top,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top,
            justifyContent: 'flex-start',
            paddingHorizontal: 4,
            gap: 4,
          },
          Platform.OS !== 'web' && {
            backgroundColor: theme.colors.surfaceContainerLow,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          },
        ]}
      >
        <RoundIconButton
          icon='chevronBack'
          onPress={goBack}
          size={24}
          color={theme.colors.onSurface}
          style={{ padding: 12, borderRadius: 48 }}
        />
        <Text style={{ fontSize: 20, color: theme.colors.onSurface, fontWeight: 600 }}>
          {title}
        </Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        <View
          onLayout={onLayout}
          style={{ flex: 1, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 16 : 0) }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export interface ModalScreenProps {
  goBack: () => void
  title: string
  opaque: boolean
  children: React.ReactNode
  maxWidth?: number
  maxHeight?: number
  onLayout?: (event: LayoutChangeEvent) => void
}

function ModalScreen({
  goBack,
  title,
  opaque,
  children,
  onLayout,
  maxWidth = 768,
  maxHeight = 600,
}: ModalScreenProps) {
  const theme = useTheme()

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: opaque ? '#000000a0' : 'transparent',
      }}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={goBack} />
      <Animated.View
        style={{
          width: '90%',
          height: '80%',
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
          borderRadius: 16,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 4,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 800, color: theme.colors.onSurface }}>
            {title}
          </Text>
          <RoundIconButton icon='close' onPress={goBack} />
        </View>
        <View onLayout={onLayout} style={{ flex: 1 }}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

export interface ModalProps {
  returnPath: string
  title: string
  children: React.ReactNode
  maxWidth?: number
  maxHeight?: number
  onLayout?: (event: LayoutChangeEvent) => void
  opaque?: boolean
}

export default function Modal({ returnPath, opaque = true, ...props }: ModalProps) {
  const router = useRouter()
  const isSmallScreen = useDisplayClass() <= DisplayClass.Expanded

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.dismissTo(returnPath)
    }
  }, [router, returnPath])

  if (isSmallScreen) {
    return (
      <FullscreenModal title={props.title} goBack={goBack} onLayout={props.onLayout}>
        {props.children}
      </FullscreenModal>
    )
  } else {
    return <ModalScreen {...props} goBack={goBack} opaque={opaque} />
  }
}
