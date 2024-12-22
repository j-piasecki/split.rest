import { RoundIconButton } from './RoundIconButton'
import { Button } from '@components/Button'
import { Text } from '@components/Text'
import { TextInput } from '@components/TextInput'
import { useTheme } from '@styling/theme'
import React, { useEffect, useImperativeHandle } from 'react'
import { useState } from 'react'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

export interface EditableTextProps {
  value: string
  onSubmit: (text: string) => void
  isPending: boolean
  placeholder?: string
  disabled?: boolean
  iconHidden?: boolean
  editing?: boolean
  onEditingChange?: (editing: boolean) => void
}

export interface EditableTextRef {
  edit: () => void
  cancel: () => void
}

export const EditableText = React.forwardRef<EditableTextRef, EditableTextProps>(
  function EditableText(
    { value, placeholder, onSubmit, isPending, disabled, iconHidden }: EditableTextProps,
    ref: React.Ref<EditableTextRef>
  ) {
    const theme = useTheme()
    const [editing, setEditing] = useState(false)
    const [text, setText] = useState(value)

    useEffect(() => {
      if (!isPending) {
        setEditing(false)
      }
    }, [isPending])

    useImperativeHandle(ref, () => ({
      edit: () => {
        setEditing(true)
      },
      cancel: () => {
        setText(value)
        setEditing(false)
      },
    }))

    if (editing || isPending) {
      return (
        <Animated.View
          key={'editing'}
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(100)}
          style={{
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextInput
            editable={!isPending}
            value={text}
            onChangeText={setText}
            style={{ flex: 1 }}
            selectTextOnFocus
            placeholder={placeholder}
          />
          <Button
            disabled={text === value}
            leftIcon='check'
            isLoading={isPending}
            onPress={() => {
              onSubmit(text)
            }}
          />
        </Animated.View>
      )
    } else {
      return (
        <Animated.View
          key={'notEditing'}
          exiting={FadeOut.duration(100)}
          entering={FadeIn.duration(100)}
          style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 24, fontWeight: '600', color: theme.colors.onSurface }}>
            {value}
          </Text>
          {!disabled && !iconHidden && (
            <RoundIconButton
              icon='editAlt'
              onPress={() => setEditing(true)}
              style={({ pressed, hovered }) => ({
                opacity: pressed ? 0.9 : hovered ? 0.7 : 0.5,
              })}
            />
          )}
        </Animated.View>
      )
    }
  }
)
