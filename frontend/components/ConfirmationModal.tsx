import { Button } from './Button'
import { IconName } from './Icon'
import { Text } from './Text'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { LanguageTranslationKey } from 'shared'

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
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 16,
            margin: 8,
            maxWidth: 500,
            gap: 16,
          }}
        >
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 22 }}>{t(title)}</Text>

          {message && (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>{t(message)}</Text>
          )}

          <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}
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
              isLoading={isDeleting}
              style={{ flexGrow: 1 }}
              destructive={destructive}
              onPress={async () => {
                setIsDeleting(true)
                onConfirm?.()
                  .then(() => {
                    onClose?.()
                  })
                  .catch(() => {
                    alert(t('api.auth.tryAgain'))
                  })
                  .finally(() => {
                    setIsDeleting(false)
                  })
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
