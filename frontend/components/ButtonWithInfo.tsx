import { LanguageTranslationKey } from 'shared'
import { Button, ButtonProps } from './Button'
import { ConfirmationModal } from './ConfirmationModal'
import { RoundIconButton } from './RoundIconButton'
import { useTheme } from '@styling/theme'
import { useState } from 'react'
import { View } from 'react-native'

export interface ButtonWithInfoProps extends ButtonProps {
  infoTitle: LanguageTranslationKey
  infoMessage?: LanguageTranslationKey
}

export function ButtonWithInfo({ infoTitle, infoMessage, ...rest }: ButtonWithInfoProps) {
  const theme = useTheme()
  const [infoOpened, setInfoOpened] = useState(false)

  return (
    <>
      <Button {...rest}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 8,
            top: 0,
            bottom: 0,
          }}
        >
          <RoundIconButton
            style={{opacity: 0.7}}
            color={theme.colors.onPrimaryContainer}
            icon='info'
            onPress={() => {
              setInfoOpened(true)
            }}
          />
        </View>
      </Button>

      <ConfirmationModal
        visible={infoOpened}
        title={infoTitle}
        message={infoMessage}
        confirmText={'ok'}
        confirmIcon='check'
        onClose={() => {
          setInfoOpened(false)
        }}
        onConfirm={async () => {
          setInfoOpened(false)
        }}
      />
    </>
  )
}
