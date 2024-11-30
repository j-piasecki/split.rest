import { useTheme } from "@styling/theme"
import { Pressable, Text } from "react-native"

export interface ButtonProps {
  title: string
  onPress?: () => void
}

export function Button({ title, onPress }: ButtonProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress} style={(state) => {
      return {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryContainer,
        opacity: state.pressed ? 0.7 : 1,
        alignItems: 'center',
      }
    }}>
      <Text selectable={false} style={{ color: theme.colors.onPrimaryContainer }}>{title}</Text>
    </Pressable>
  )
}