import { Button } from './Button'
import { IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated'
import { LanguageTranslationKey, isTranslatableError } from 'shared'

export interface ConfirmationModalProps {
  visible: boolean
  title: LanguageTranslationKey
  confirmText: LanguageTranslationKey
  confirmIcon?: IconName
  cancelText?: LanguageTranslationKey
  cancelIcon?: IconName
  message?: LanguageTranslationKey
  onConfirm: () => Promise<void>
  onClose?: () => void
  destructive?: boolean
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  confirmIcon,
  cancelText,
  cancelIcon,
  onConfirm,
  onClose,
  destructive,
}: ConfirmationModalProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [isWaiting, setIsWaiting] = useState(false)

  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View
          style={StyleSheet.absoluteFill}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(200)}
          style={{
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 16,
            margin: 8,
            maxWidth: 500,
            gap: 16,
          }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 22, fontWeight: 600 }}>
            {t(title)}
          </Text>

          {message && (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>{t(message)}</Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 16,
              marginTop: 16,
            }}
          >
            {(cancelText || cancelIcon) && (
              <Button
                title={cancelText ? t(cancelText) : undefined}
                leftIcon={cancelIcon}
                onPress={onClose}
                style={{ flexGrow: 1, backgroundColor: theme.colors.secondaryContainer }}
                foregroundColor={theme.colors.onSecondaryContainer}
              />
            )}
            <Button
              title={t(confirmText)}
              leftIcon={confirmIcon}
              isLoading={isWaiting}
              style={{ flexGrow: 1 }}
              destructive={destructive}
              onPress={async () => {
                setIsWaiting(true)
                onConfirm?.()
                  .then(() => {
                    onClose?.()
                  })
                  .catch((e) => {
                    if (isTranslatableError(e)) {
                      alert(t(e.message, e.args))
                    } else {
                      alert(t('api.auth.tryAgain'))
                    }
                  })
                  .finally(() => {
                    setIsWaiting(false)
                  })
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
