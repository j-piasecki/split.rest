/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, ImageStyle } from 'expo-image'
import { StyleProp, View } from 'react-native'

export type IconName =
  | 'addMember'
  | 'addModerator'
  | 'add'
  | 'check'
  | 'chevronBack'
  | 'close'
  | 'copy'
  | 'currency'
  | 'delete'
  | 'deleteForever'
  | 'edit'
  | 'home'
  | 'lockOpen'
  | 'lock'
  | 'login'
  | 'logout'
  | 'members'
  | 'money'
  | 'moreVertical'
  | 'payments'
  | 'receipt'
  | 'removeModerator'
  | 'save'
  | 'settings'
  | 'shield'
  | 'split'
  | 'visibility_off'
  | 'visibility'

export interface IconProps {
  name: IconName
  size: number
  color: string
  style?: StyleProp<ImageStyle>
}

const iconMap: Record<IconName, unknown> = {
  addMember: require('@assets/icons/add_member.svg'),
  addModerator: require('@assets/icons/add_moderator.svg'),
  add: require('@assets/icons/add.svg'),
  check: require('@assets/icons/check.svg'),
  chevronBack: require('@assets/icons/chevron_back.svg'),
  close: require('@assets/icons/close.svg'),
  copy: require('@assets/icons/copy.svg'),
  currency: require('@assets/icons/currency.svg'),
  delete: require('@assets/icons/delete.svg'),
  deleteForever: require('@assets/icons/delete_forever.svg'),
  edit: require('@assets/icons/edit.svg'),
  home: require('@assets/icons/home.svg'),
  lockOpen: require('@assets/icons/lock_open.svg'),
  lock: require('@assets/icons/lock.svg'),
  login: require('@assets/icons/login.svg'),
  logout: require('@assets/icons/logout.svg'),
  members: require('@assets/icons/members.svg'),
  money: require('@assets/icons/money.svg'),
  moreVertical: require('@assets/icons/more_vertical.svg'),
  payments: require('@assets/icons/payments.svg'),
  receipt: require('@assets/icons/receipt.svg'),
  removeModerator: require('@assets/icons/remove_moderator.svg'),
  save: require('@assets/icons/save.svg'),
  settings: require('@assets/icons/settings.svg'),
  shield: require('@assets/icons/shield.svg'),
  split: require('@assets/icons/split.svg'),
  visibility_off: require('@assets/icons/visibility_off.svg'),
  visibility: require('@assets/icons/visibility.svg'),
}

export function Icon({ name, size, color, style }: IconProps) {
  if (color === 'transparent') {
    // @ts-expect-error style type doesn't match but it should be fine
    return <View style={[style, { width: size, height: size }]} />
  }

  return (
    <Image
      source={iconMap[name]}
      style={[style, { width: size, height: size }]}
      tintColor={color}
    />
  )
}
