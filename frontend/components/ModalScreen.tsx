import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@styling/theme'
import { useIsSmallScreen } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export interface FullscreenModalProps {
  goBack: () => void
  title: string
  children: React.ReactNode
}

function FullscreenModal({ children, title, goBack }: FullscreenModalProps) {
  const theme = useTheme()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 24,
          justifyContent: 'flex-start',
          gap: 16,
        }}
      >
        <Pressable onPress={goBack}>
          <Ionicons name='chevron-back' size={28} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={{ fontSize: 24, color: theme.colors.onSurface }}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

export interface ModalScreenProps {
  goBack: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
  maxHeight?: number
}

function ModalScreen({
  goBack,
  title,
  children,
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
        backgroundColor: '#000000a0',
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
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 4,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>
            {title}
          </Text>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => {
              return {
                backgroundColor: pressed ? theme.colors.surfaceBright : 'transparent',
                borderRadius: 22,
                padding: 4,
              }
            }}
          >
            <Ionicons name='close' size={28} color={theme.colors.onSurface} />
          </Pressable>
        </View>
        {children}
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
}

export default function Modal({ returnPath, ...props }: ModalProps) {
  const router = useRouter()
  const isSmallScreen = useIsSmallScreen()

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(returnPath)
    }
  }, [router, returnPath])

  if (isSmallScreen) {
    return (
      <FullscreenModal title={props.title} goBack={goBack}>
        {props.children}
      </FullscreenModal>
    )
  } else {
    return <ModalScreen {...props} goBack={goBack} />
  }
}
