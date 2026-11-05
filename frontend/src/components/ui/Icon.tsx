import React from 'react';
import { SymbolView } from 'expo-symbols';
import { colors } from '@/theme';
import { ActivityIconName } from '@/types/domain';

export type IconName =
  | 'home' | 'list' | 'history' | 'account' | 'calendar' | 'check' | 'clock' | 'chart' | 'target'
  | 'cash' | 'search' | 'tune' | 'plus' | 'edit' | 'delete' | 'undo' | 'settings' | 'lock'
  | 'arrow-left' | 'arrow-right' | 'close' | 'information' | 'alert' | 'flag' | 'logout' | 'email' | 'eye'
  | 'star' | 'star-filled' | 'dots' | 'cancel' | 'clipboard' | 'help' | 'file' | 'restore' | 'filter' | 'check-circle'
  | 'trash' | 'trend-up' | 'market' | 'study' | 'work' | 'health' | 'house' | 'payment' | 'leisure' | 'other'
  | 'arrow-up' | 'arrow-down' | 'chevron-down' | 'chevron-right' | 'menu' | 'user' | 'phone' | 'shield';

const map: Record<IconName, [string, string]> = {
  home: ['house.fill', 'home'], list: ['list.bullet', 'format_list_bulleted'], history: ['chart.bar.xaxis', 'bar_chart'], account: ['person', 'person'],
  calendar: ['calendar', 'calendar_month'], check: ['checkmark', 'check'], clock: ['clock', 'schedule'], chart: ['chart.bar.fill', 'bar_chart'], target: ['target', 'my_location'],
  cash: ['banknote', 'payments'], 'arrow-up': ['arrow.up', 'arrow_upward'], 'arrow-down': ['arrow.down', 'arrow_downward'], search: ['magnifyingglass', 'search'], tune: ['slider.horizontal.3', 'tune'], plus: ['plus', 'add'], edit: ['pencil', 'edit'],
  delete: ['trash', 'delete_outline'], undo: ['arrow.uturn.backward', 'undo'], settings: ['gearshape', 'settings'], lock: ['lock', 'lock_outline'],
  'arrow-left': ['arrow.left', 'arrow_back'], 'arrow-right': ['arrow.right', 'arrow_forward'], close: ['xmark', 'close'], information: ['info.circle', 'info_outline'], alert: ['exclamationmark.circle', 'error_outline'],
  flag: ['flag', 'flag'], logout: ['rectangle.portrait.and.arrow.right', 'logout'], email: ['envelope', 'mail_outline'], eye: ['eye', 'visibility'], star: ['star', 'star_outline'], 'star-filled': ['star.fill', 'star'], dots: ['ellipsis', 'more_vert'], cancel: ['nosign', 'cancel'],
  clipboard: ['checklist', 'assignment'], help: ['questionmark.circle', 'help_outline'], file: ['doc.text', 'description'], restore: ['arrow.clockwise', 'restore'], filter: ['line.3.horizontal.decrease', 'filter_alt'], 'check-circle': ['checkmark.circle.fill', 'check_circle'],
  trash: ['trash.circle', 'delete_sweep'], 'trend-up': ['chart.line.uptrend.xyaxis', 'trending_up'], market: ['cart', 'shopping_cart'], study: ['graduationcap', 'school'], work: ['briefcase', 'work_outline'], health: ['heart', 'favorite_border'], house: ['house', 'home'], payment: ['wallet.pass', 'account_balance_wallet'], leisure: ['figure.walk', 'self_improvement'], other: ['ellipsis.circle', 'more_horiz'],
  'chevron-down': ['chevron.down', 'expand_more'], 'chevron-right': ['chevron.right', 'chevron_right'], menu: ['line.3.horizontal', 'menu'], user: ['person.circle', 'account_circle'], phone: ['phone', 'phone'], shield: ['checkmark.shield', 'verified_user'],
};

const activityMap: Record<ActivityIconName, IconName> = {
  market: 'market', study: 'study', work: 'work', health: 'health', home: 'house', payment: 'payment', leisure: 'leisure', other: 'other'
};

export function ActivityIcon({ icon, size = 22, color = colors.navy }: { icon: ActivityIconName; size?: number; color?: string }) {
  return <Icon name={activityMap[icon]} size={size} color={color} />;
}

export function Icon({ name, size = 22, color = colors.navy, style }: { name: IconName; size?: number; color?: string; style?: any }) {
  const [ios, android] = map[name];
  return <SymbolView name={{ ios: ios as any, android: android as any, web: android as any }} tintColor={color} size={size} style={style} />;
}
