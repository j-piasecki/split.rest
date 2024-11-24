import { isSmallScreen } from '@utils/isSmallScreen'
import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { Button, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export interface ModalScreenProps {
  returnPath: string
  title: string
  children: React.ReactNode
  maxWidth?: number
  maxHeight?: number
}

function FullscreenModal({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View
      style={{
        flex: 1,
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
        backgroundColor: '#00000040',
      }}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={goBack} />
      <Animated.View
        style={{
          width: '90%',
          height: '80%',
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          backgroundColor: 'white',
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
          <Text style={{ fontSize: 20 }}>{title}</Text>
          <Button title='Close' onPress={goBack} />
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
