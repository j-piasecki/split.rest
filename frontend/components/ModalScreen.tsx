import AntDesign from '@expo/vector-icons/AntDesign'
import { useTheme } from '@styling/theme'
import { isSmallScreen } from '@utils/isSmallScreen'
import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export interface ModalScreenProps {
  returnPath: string
  title: string
  children: React.ReactNode
  maxWidth?: number
  maxHeight?: number
}

function FullscreenModal({ children, title }: { children: React.ReactNode; title: string }) {
  const theme = useTheme()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundElevated,
      }}
    >
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 20 }}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

function ModalScreen({
  returnPath,
  title,
  children,
  maxWidth = 768,
  maxHeight = 600,
}: ModalScreenProps) {
  const router = useRouter()
  const theme = useTheme()

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(returnPath)
    }
  }, [router, returnPath])

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
          backgroundColor: theme.colors.backgroundElevated,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>
            {title}
          </Text>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => {
              return {
                backgroundColor: pressed ? theme.colors.highlight : 'transparent',
                borderRadius: 22,
                padding: 4,
              }
            }}
          >
            <AntDesign name='close' size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        {children}
      </Animated.View>
    </Animated.View>
  )
}

export default function Modal(props: ModalScreenProps) {
  const windowSize = useWindowDimensions()

  if (isSmallScreen(windowSize.width)) {
    return <FullscreenModal title={props.title}>{props.children}</FullscreenModal>
  } else {
    return <ModalScreen {...props} />
  }
}
