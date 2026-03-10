import { LargeTextInput } from '@components/LargeTextInput'
import { RoundIconButton } from '@components/RoundIconButton'
import { useTheme } from '@styling/theme'
import React, { useState } from 'react'
import { View } from 'react-native'

export function DisplayNameSetter({
  initialValue,
  placeholder,
  isLoading,
  canEdit,
  onSave,
  onDelete,
}: {
  initialValue: string | null
  placeholder: string
  isLoading: boolean
  canEdit: boolean
  onSave: (newName: string) => void | Promise<void>
  onDelete?: () => void | Promise<void>
}) {
  const theme = useTheme()
  const [value, setValue] = useState<string | null>(initialValue)

  const showSaveButton = canEdit && value !== null && value !== (initialValue ?? '')
  const showDeleteButton = !!onDelete && !showSaveButton && initialValue !== null

  const handleSave = async () => {
    if (value === null) {
      return
    }
    await onSave(value)
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete()
      setValue(null)
    }
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <LargeTextInput
        placeholder={placeholder}
        disabled={!canEdit || isLoading}
        value={value ?? ''}
        onChangeText={setValue}
        containerStyle={{ flex: 1, paddingRight: 56 }}
        onSubmit={() => showSaveButton && handleSave()}
        autoCorrect={false}
      />
      <View
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {(showSaveButton || showDeleteButton) && (
          <RoundIconButton
            opaque
            color={theme.colors.secondary}
            icon={showSaveButton ? 'saveAlt' : 'close'}
            onPress={showSaveButton ? handleSave : handleDelete}
            size={32}
            isLoading={isLoading}
          />
        )}
      </View>
    </View>
  )
}
