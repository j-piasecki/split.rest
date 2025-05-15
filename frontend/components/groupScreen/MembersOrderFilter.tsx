import { SegmentedButton } from '@components/SegmentedButton'
import { StyleProp, ViewStyle } from 'react-native'

export function MembersOrderFilter({
  style,
  lowToHigh,
  onChange,
}: {
  style?: StyleProp<ViewStyle>
  lowToHigh: boolean | undefined
  onChange: (lowToHigh: boolean | undefined) => void
}) {
  return (
    <SegmentedButton
      // this seems to work with flex
      style={[{ maxWidth: 144, minWidth: 144 }, style]}
      items={[
        {
          icon: 'sortDescending',
          selected: lowToHigh === false,
          onPress: () => {
            if (lowToHigh !== false) {
              onChange(false)
            }
          },
        },
        {
          icon: 'menu',
          selected: lowToHigh === undefined,
          onPress: () => {
            if (lowToHigh !== undefined) {
              onChange(undefined)
            }
          },
        },
        {
          icon: 'sortAscending',
          selected: lowToHigh === true,
          onPress: () => {
            if (lowToHigh !== true) {
              onChange(true)
            }
          },
        },
      ]}
    />
  )
}
