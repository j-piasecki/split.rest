import { KeyboardAvoidingView } from './KeyboardAvoidingView'
import { RoundIconButton } from './RoundIconButton'
import { Text } from '@components/Text'
import { useTheme } from '@styling/theme'
import { DisplayClass, useDisplayClass } from '@utils/dimensionUtils'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { runOnJS } from 'react-native-worklets'

interface ModalScreenOpaqueContextType {
  registerModal: (opaqueStatusListener: (opaque: boolean) => void) => () => void
}

const ModalScreenOpaqueContext = React.createContext<ModalScreenOpaqueContextType>({
  registerModal: () => () => {},
})

export function ModalScreenOpaqueContextProvider({ children }: { children: React.ReactNode }) {
  const modalListeners = React.useRef<{ listener: (opaque: boolean) => void; id: number }[]>([])

  function registerModal(opaqueStatusListener: (opaque: boolean) => void) {
    const id = modalListeners.current.reduce((max, listener) => Math.max(max, listener.id), 0) + 1
    modalListeners.current.push({ listener: opaqueStatusListener, id })

    opaqueStatusListener(modalListeners.current.length === 1)

    return () => {
      const wasFirst = modalListeners.current[0]?.id === id
      modalListeners.current = modalListeners.current.filter((listener) => listener.id !== id)

      if (wasFirst && modalListeners.current.length > 0) {
        modalListeners.current[0].listener(true)
      }
    }
  }

  return (
    <ModalScreenOpaqueContext.Provider
      value={{
        registerModal,
      }}
    >
      {children}
    </ModalScreenOpaqueContext.Provider>
  )
}

function useModalScreenOpaque() {
  const [opaque, setOpaque] = React.useState(false)
  const { registerModal } = React.useContext(ModalScreenOpaqueContext)

  useEffect(() => {
    const removeListener = registerModal((opaque) => {
      setOpaque(opaque)
    })
    return removeListener
  }, [registerModal])

  return opaque
}

export interface FullscreenModalProps {
  goBack: () => void
  title: string
  children: React.ReactNode
  onLayout?: (event: LayoutChangeEvent) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function FullscreenModal({ children, title, goBack, onLayout }: FullscreenModalProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
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
            paddingHorizontal: Platform.OS !== 'ios' ? 8 : 4,
            gap: Platform.OS !== 'ios' ? 16 : 4,
          },
          Platform.OS === 'ios' && {
            backgroundColor: theme.colors.surfaceContainerLow,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          },
        ]}
      >
        <RoundIconButton
          icon={Platform.OS !== 'ios' ? 'arrowBack' : 'chevronBack'}
          onPress={goBack}
          size={24}
          color={theme.colors.onSurface}
          style={{
            padding: 12,
            borderRadius: 48,
          }}
        />
        <Text
          style={{
            flex: 1,
            paddingRight: Platform.OS !== 'ios' ? 0 : 48,
            textAlign: Platform.OS !== 'ios' ? 'left' : 'center',
            fontSize: Platform.OS !== 'ios' ? 22 : 20,
            color: theme.colors.onSurface,
            fontWeight: 600,
          }}
        >
          {title}
        </Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} reduceInset={16}>
        <View onLayout={onLayout} style={{ flex: 1 }}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export interface ModalScreenProps {
  goBack: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
  onLayout?: (event: LayoutChangeEvent) => void
}

function ModalScreen({ goBack, title, children, onLayout, maxWidth = 540 }: ModalScreenProps) {
  const theme = useTheme()
  const opaque = useModalScreenOpaque()
  const slideProgress = useSharedValue(0)
  const measuredWidth = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const underlayStyle = useAnimatedStyle(() => {
    return {
      opacity: slideProgress.value,
    }
  })

  const slideStyle = useAnimatedStyle(() => {
    return {
      opacity: measuredWidth.value > 0 ? 1 : 0,
      transform: [{ translateX: (1 - slideProgress.value) * measuredWidth.value }],
    }
  })

  function close() {
    slideProgress.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.sin) }, () => {
      runOnJS(goBack)()
    })
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'flex-end',
      }}
    >
      <AnimatedPressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: opaque ? '#000000a0' : 'transparent' },
          underlayStyle,
        ]}
        onPress={close}
      />
      <Animated.View
        onLayout={(e) => {
          measuredWidth.value = e.nativeEvent.layout.width
          slideProgress.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.sin) })
        }}
        style={[
          {
            width: '80%',
            height: '100%',
            maxWidth: maxWidth,
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
            paddingTop: insets.top,
            paddingRight: insets.right,
          },
          slideStyle,
        ]}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 800, color: theme.colors.onSurface }}>
            {title}
          </Text>
          <RoundIconButton icon='close' onPress={close} />
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
  onLayout?: (event: LayoutChangeEvent) => void
}

export default function Modal({ returnPath, ...props }: ModalProps) {
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
    return <ModalScreen {...props} goBack={goBack} />
  }
}
