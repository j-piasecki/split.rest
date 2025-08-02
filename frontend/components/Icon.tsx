/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, ImageStyle } from 'expo-image'
import { StyleProp, View } from 'react-native'

export type IconName =
  | 'addAllMembers'
  | 'addLink'
  | 'addMember'
  | 'addModerator'
  | 'add'
  | 'allOf'
  | 'appleLogo'
  | 'arrowBack'
  | 'arrowDown'
  | 'arrowDownAlt'
  | 'arrowUp'
  | 'articlePerson'
  | 'arrowUpAlt'
  | 'automation'
  | 'average'
  | 'balance'
  | 'barChartAlt'
  | 'barChart'
  | 'bug'
  | 'cached'
  | 'calendarEdit'
  | 'calendar'
  | 'casino'
  | 'change'
  | 'checkCircle'
  | 'check'
  | 'chevronBack'
  | 'chevronForward'
  | 'chronic'
  | 'closeRightPanel'
  | 'close'
  | 'copy'
  | 'currency'
  | 'darkTheme'
  | 'delete'
  | 'deleteForever'
  | 'deleteLink'
  | 'doneAll'
  | 'editAlt'
  | 'editOff'
  | 'edit'
  | 'equal'
  | 'erase'
  | 'exactAmount'
  | 'filter'
  | 'group'
  | 'home'
  | 'hourglass'
  | 'info'
  | 'lightTheme'
  | 'link'
  | 'listNumbered'
  | 'list'
  | 'lockOpen'
  | 'lock'
  | 'login'
  | 'logout'
  | 'matchCase'
  | 'members'
  | 'menu'
  | 'merge'
  | 'money'
  | 'moreVertical'
  | 'oneOf'
  | 'openRightPanel'
  | 'payment'
  | 'payments'
  | 'pieChart'
  | 'receipt'
  | 'removeModerator'
  | 'regex'
  | 'save'
  | 'schedule'
  | 'sell'
  | 'settings'
  | 'shield'
  | 'sortAscending'
  | 'sortDescending'
  | 'split'
  | 'stackedEmail'
  | 'systemTheme'
  | 'tag'
  | 'timeline'
  | 'title'
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
  addAllMembers: require('@assets/icons/add_all_members.svg'),
  addLink: require('@assets/icons/add_link.svg'),
  addMember: require('@assets/icons/add_member.svg'),
  addModerator: require('@assets/icons/add_moderator.svg'),
  add: require('@assets/icons/add.svg'),
  allOf: require('@assets/icons/all_of.svg'),
  appleLogo: require('@assets/icons/apple_logo.svg'),
  arrowBack: require('@assets/icons/arrow_back.svg'),
  arrowDown: require('@assets/icons/arrow_down.svg'),
  arrowDownAlt: require('@assets/icons/arrow_down_alt.svg'),
  articlePerson: require('@assets/icons/article_person.svg'),
  arrowUp: require('@assets/icons/arrow_up.svg'),
  arrowUpAlt: require('@assets/icons/arrow_up_alt.svg'),
  automation: require('@assets/icons/automation.svg'),
  average: require('@assets/icons/average.svg'),
  balance: require('@assets/icons/balance.svg'),
  barChartAlt: require('@assets/icons/bar_chart_alt.svg'),
  barChart: require('@assets/icons/bar_chart.svg'),
  bug: require('@assets/icons/bug.svg'),
  cached: require('@assets/icons/cached.svg'),
  calendarEdit: require('@assets/icons/calendar_edit.svg'),
  calendar: require('@assets/icons/calendar.svg'),
  casino: require('@assets/icons/casino.svg'),
  change: require('@assets/icons/change.svg'),
  checkCircle: require('@assets/icons/check_circle.svg'),
  check: require('@assets/icons/check.svg'),
  chevronBack: require('@assets/icons/chevron_back.svg'),
  chevronForward: require('@assets/icons/chevron_forward.svg'),
  chronic: require('@assets/icons/chronic.svg'),
  closeRightPanel: require('@assets/icons/close_right_panel.svg'),
  close: require('@assets/icons/close.svg'),
  copy: require('@assets/icons/copy.svg'),
  currency: require('@assets/icons/currency.svg'),
  darkTheme: require('@assets/icons/dark_theme.svg'),
  delete: require('@assets/icons/delete.svg'),
  deleteForever: require('@assets/icons/delete_forever.svg'),
  deleteLink: require('@assets/icons/delete_link.svg'),
  doneAll: require('@assets/icons/done_all.svg'),
  editAlt: require('@assets/icons/edit_alt.svg'),
  editOff: require('@assets/icons/edit_off.svg'),
  edit: require('@assets/icons/edit.svg'),
  equal: require('@assets/icons/equal.svg'),
  erase: require('@assets/icons/erase.svg'),
  exactAmount: require('@assets/icons/exact_amount.svg'),
  filter: require('@assets/icons/filter.svg'),
  group: require('@assets/icons/group.svg'),
  home: require('@assets/icons/home.svg'),
  hourglass: require('@assets/icons/hourglass.svg'),
  info: require('@assets/icons/info.svg'),
  lightTheme: require('@assets/icons/light_theme.svg'),
  link: require('@assets/icons/link.svg'),
  listNumbered: require('@assets/icons/list_numbered.svg'),
  list: require('@assets/icons/list.svg'),
  lockOpen: require('@assets/icons/lock_open.svg'),
  lock: require('@assets/icons/lock.svg'),
  login: require('@assets/icons/login.svg'),
  logout: require('@assets/icons/logout.svg'),
  matchCase: require('@assets/icons/match_case.svg'),
  members: require('@assets/icons/members.svg'),
  menu: require('@assets/icons/menu.svg'),
  merge: require('@assets/icons/merge.svg'),
  money: require('@assets/icons/money.svg'),
  moreVertical: require('@assets/icons/more_vertical.svg'),
  oneOf: require('@assets/icons/one_of.svg'),
  openRightPanel: require('@assets/icons/open_right_panel.svg'),
  payment: require('@assets/icons/payment.svg'),
  payments: require('@assets/icons/payments.svg'),
  pieChart: require('@assets/icons/pie_chart.svg'),
  receipt: require('@assets/icons/receipt.svg'),
  removeModerator: require('@assets/icons/remove_moderator.svg'),
  regex: require('@assets/icons/regex.svg'),
  save: require('@assets/icons/save.svg'),
  schedule: require('@assets/icons/schedule.svg'),
  sell: require('@assets/icons/sell.svg'),
  settings: require('@assets/icons/settings.svg'),
  shield: require('@assets/icons/shield.svg'),
  sortAscending: require('@assets/icons/sort_ascending.svg'),
  sortDescending: require('@assets/icons/sort_descending.svg'),
  split: require('@assets/icons/split.svg'),
  stackedEmail: require('@assets/icons/stacked_email.svg'),
  systemTheme: require('@assets/icons/system_theme.svg'),
  tag: require('@assets/icons/tag.svg'),
  timeline: require('@assets/icons/timeline.svg'),
  title: require('@assets/icons/title.svg'),
  undo: require('@assets/icons/undo.svg'),
  user: require('@assets/icons/user.svg'),
  visibilityOff: require('@assets/icons/visibility_off.svg'),
  visibility: require('@assets/icons/visibility.svg'),
}

// @ts-expect-error array of strings is expected, unknown is provided
Image.prefetch(Object.values(iconMap))

export function Icon({ name, size, color, style }: IconProps) {
  if (color === 'transparent') {
    return <View style={[style, { width: size, height: size }]} />
  }

  return (
    <Image
      // @ts-expect-error - source type doesn't match but it should be fine
      source={name === undefined ? null : iconMap[name]}
      style={[style, { width: size, height: size }]}
      tintColor={color}
      contentFit='contain'
    />
  )
}
