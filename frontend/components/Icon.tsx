/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, ImageStyle } from 'expo-image'
import { StyleProp, View } from 'react-native'

export type IconName =
  | 'addLink'
  | 'addMember'
  | 'addModerator'
  | 'add'
  | 'appleLogo'
  | 'arrowDown'
  | 'arrowUp'
  | 'bug'
  | 'calendar'
  | 'check'
  | 'chevronBack'
  | 'chevronForward'
  | 'closeRightPanel'
  | 'close'
  | 'copy'
  | 'currency'
  | 'delete'
  | 'deleteForever'
  | 'deleteLink'
  | 'editAlt'
  | 'edit'
  | 'equal'
  | 'exactAmount'
  | 'group'
  | 'home'
  | 'link'
  | 'listNumbered'
  | 'lockOpen'
  | 'lock'
  | 'login'
  | 'logout'
  | 'members'
  | 'money'
  | 'moreVertical'
  | 'openRightPanel'
  | 'payments'
  | 'receipt'
  | 'removeModerator'
  | 'save'
  | 'settings'
  | 'shield'
  | 'split'
  | 'stackedEmail'
  | 'tag'
  | 'undo'
  | 'user'
  | 'visibilityOff'
  | 'visibility'

export interface IconProps {
  name?: IconName
  size?: number
  color?: string
  style?: StyleProp<ImageStyle>
}

const iconMap: Record<IconName, unknown> = {
  addLink: require('@assets/icons/add_link.svg'),
  addMember: require('@assets/icons/add_member.svg'),
  addModerator: require('@assets/icons/add_moderator.svg'),
  add: require('@assets/icons/add.svg'),
  appleLogo: require('@assets/icons/apple_logo.svg'),
  arrowDown: require('@assets/icons/arrow_down.svg'),
  arrowUp: require('@assets/icons/arrow_up.svg'),
  bug: require('@assets/icons/bug.svg'),
  calendar: require('@assets/icons/calendar.svg'),
  check: require('@assets/icons/check.svg'),
  chevronBack: require('@assets/icons/chevron_back.svg'),
  chevronForward: require('@assets/icons/chevron_forward.svg'),
  closeRightPanel: require('@assets/icons/close_right_panel.svg'),
  close: require('@assets/icons/close.svg'),
  copy: require('@assets/icons/copy.svg'),
  currency: require('@assets/icons/currency.svg'),
  delete: require('@assets/icons/delete.svg'),
  deleteForever: require('@assets/icons/delete_forever.svg'),
  deleteLink: require('@assets/icons/delete_link.svg'),
  editAlt: require('@assets/icons/edit_alt.svg'),
  edit: require('@assets/icons/edit.svg'),
  equal: require('@assets/icons/equal.svg'),
  exactAmount: require('@assets/icons/exact_amount.svg'),
  group: require('@assets/icons/group.svg'),
  home: require('@assets/icons/home.svg'),
  link: require('@assets/icons/link.svg'),
  listNumbered: require('@assets/icons/list_numbered.svg'),
  lockOpen: require('@assets/icons/lock_open.svg'),
  lock: require('@assets/icons/lock.svg'),
  login: require('@assets/icons/login.svg'),
  logout: require('@assets/icons/logout.svg'),
  members: require('@assets/icons/members.svg'),
  money: require('@assets/icons/money.svg'),
  moreVertical: require('@assets/icons/more_vertical.svg'),
  openRightPanel: require('@assets/icons/open_right_panel.svg'),
  payments: require('@assets/icons/payments.svg'),
  receipt: require('@assets/icons/receipt.svg'),
  removeModerator: require('@assets/icons/remove_moderator.svg'),
  save: require('@assets/icons/save.svg'),
  settings: require('@assets/icons/settings.svg'),
  shield: require('@assets/icons/shield.svg'),
  split: require('@assets/icons/split.svg'),
  stackedEmail: require('@assets/icons/stacked_email.svg'),
  tag: require('@assets/icons/tag.svg'),
  undo: require('@assets/icons/undo.svg'),
  user: require('@assets/icons/user.svg'),
  visibilityOff: require('@assets/icons/visibility_off.svg'),
  visibility: require('@assets/icons/visibility.svg'),
}

// @ts-expect-error array of strings is expected, unknown is provided
Image.prefetch(Object.values(iconMap))

export function Icon({ name, size, color, style }: IconProps) {
  if (color === 'transparent') {
    // @ts-expect-error style type doesn't match but it should be fine
    return <View style={[style, { width: size, height: size }]} />
  }

  return (
    <Image
      source={name === undefined ? null : iconMap[name]}
      style={[style, { width: size, height: size }]}
      tintColor={color}
      contentFit='contain'
    />
  )
}
