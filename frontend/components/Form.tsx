import React, { useContext, useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native'

export interface FormContextType {
  inputs: { focusIndex: number; ref: React.RefObject<TextInput> }[]
  registerInput: (focusIndex: number, ref: React.RefObject<TextInput>) => () => void
  focusNext: (focusIndex: number) => void
}

const FormContext = React.createContext<React.RefObject<FormContextType> | null>(null)

export interface FormProps {
  children: React.ReactNode
  autofocus?: boolean
  onSubmit?: () => void
}

export function Form({ autofocus, children, onSubmit }: FormProps) {
  const parentForm = useContext(FormContext)

  const value = useRef<FormContextType>({
    inputs: [],
    registerInput(focusIndex, ref) {
      if (parentForm && parentForm.current) {
        return parentForm.current.registerInput(focusIndex, ref)
      }

      if (__DEV__ && value.current.inputs.some((input) => input.focusIndex === focusIndex)) {
        throw new Error(`Input with focusIndex ${focusIndex} already exists`)
      }

      value.current.inputs.push({ focusIndex, ref })
      value.current.inputs.sort((a, b) => a.focusIndex - b.focusIndex)
      return () => {
        value.current.inputs = value.current.inputs.filter((input) => input.ref !== ref)
      }
    },
    focusNext(focusIndex) {
      if (parentForm && parentForm.current) {
        return parentForm.current.focusNext(focusIndex)
      }

      const currentIndex = value.current.inputs.findIndex(
        (input) => input.focusIndex === focusIndex
      )
      const nextInput = value.current.inputs[currentIndex + 1]

      if (currentIndex === value.current.inputs.length - 1 && onSubmit) {
        onSubmit()
      } else if (nextInput) {
        nextInput.ref.current?.focus()
      }
    },
  })

  useEffect(() => {
    setTimeout(() => {
      if (autofocus && value.current.inputs.length > 0) {
        value.current.inputs[0].ref.current?.focus()
      }
    }, 100)
  }, [autofocus])

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export function useFormContext(ref: React.RefObject<TextInput>, focusIndex?: number) {
  const context = useContext(FormContext)

  // focus index doesn't matter if context doesn't exist, it wouldn't be used anyway
  const [nextIndex] = useState(() => focusIndex ?? (context?.current?.inputs.length ?? 0) + 1)

  useEffect(() => {
    return context?.current?.registerInput(nextIndex, ref)
  }, [context, nextIndex, ref])

  return context?.current
    ? {
        focusNext: () => {
          context.current?.focusNext(nextIndex)
        },
      }
    : null
}
