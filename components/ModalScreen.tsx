import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

export interface ModalScreenProps {
  returnPath: string
  title: string
  children: React.ReactNode
}

export default function ModalScreen({ returnPath, title, children }: ModalScreenProps) {
  const router = useRouter()

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.navigate(returnPath)
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
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={goBack}
      />
      <Animated.View
        style={{
          width: '90%',
          height: '80%',
          maxWidth: 768,
          maxHeight: 600,
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
          <Button
            title='Close'
            onPress={goBack}
          />
        </View>
        {children}
      </Animated.View>
    </Animated.View>
  )
}
