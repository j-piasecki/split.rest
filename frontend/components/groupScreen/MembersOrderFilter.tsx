import { SegmentedButton } from '@components/SegmentedButton'
import { StyleProp, ViewStyle } from 'react-native'

export function MembersOrderFilter({
  style,
  lowToHigh,
  onChange,
}: {
  style?: StyleProp<ViewStyle>
  lowToHigh: boolean
  onChange: (lowToHigh: boolean) => void
}) {
  return (
    <SegmentedButton
      // this seems to work with flex
      style={[{ maxWidth: 112, minWidth: 112 }, style]}
      items={[
        {
          icon: 'sortDescending',
          selected: !lowToHigh,
          onPress: () => {
            if (lowToHigh) {
              onChange(false)
            }
          },
        },
        {
          icon: 'sortAscending',
          selected: lowToHigh,
          onPress: () => {
            if (!lowToHigh) {
              onChange(true)
            }
          },
        },
      ]}
    />
  )
}
