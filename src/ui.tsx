import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

import { theme } from './theme';

type WithChildren<T = {}> = T & { children?: React.ReactNode };
type TxtProps = WithChildren<{ style?: StyleProp<TextStyle> }>;
type ViewProps = WithChildren<{ style?: StyleProp<ViewStyle> }>;

export const Card: React.FC<ViewProps> = ({ style, children }) => (
  <View style={[styles.card, theme.shadow.card, style]}>{children}</View>
);

export const Title: React.FC<TxtProps> = ({ style, children }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const H2: React.FC<TxtProps> = ({ style, children }) => (
  <Text style={[styles.h2, style]}>{children}</Text>
);

export const Subtitle: React.FC<TxtProps> = ({ style, children }) => (
  <Text style={[styles.subtitle, style]}>{children}</Text>
);

export const Input: React.FC<
  React.ComponentProps<typeof TextInput> & { label?: string }
> = ({ label, style, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    {!!label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      {...props}
      style={[styles.input, style as any]}
      placeholderTextColor={theme.colors.subtext}
    />
  </View>
);

export const Button: React.FC<{
  title: string;
  onPress?: () => void;
  kind?: 'primary' | 'ghost' | 'outline' | 'danger';
}> = ({ title, onPress, kind = 'primary' }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.btn,
      kind === 'primary' && { backgroundColor: theme.colors.brand },
      kind === 'danger' && { backgroundColor: theme.colors.red },
      kind === 'ghost' && {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.line,
      },
      kind === 'outline' && {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.brand,
      },
    ]}
  >
    <Text
      style={[
        styles.btnText,
        (kind === 'ghost' || kind === 'outline') && { color: theme.colors.text },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const Tag: React.FC<{ tone?: 'owe' | 'lent' | 'borrowed' | 'settled'; label: string }> = ({
  tone = 'lent',
  label,
}) => {
  const map = {
    lent: { bg: '#DCFCE7', fg: '#0F9D58' },
    borrowed: { bg: '#FFECE5', fg: '#D9480F' },
    owe: { bg: '#E0F7F4', fg: theme.colors.brandDim },
    settled: { bg: '#E5E7EB', fg: '#374151' },
  } as const;
  const { bg, fg } = map[tone];
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </View>
  );
};

export const Progress: React.FC<{ value: number }> = ({ value }) => (
  <View
    style={{
      height: 8,
      backgroundColor: '#24303A',
      borderRadius: 999,
      overflow: 'hidden',
    }}
  >
    <View
      style={{
        width: `${Math.min(100, Math.max(0, value * 100))}%`,
        backgroundColor: theme.colors.brand,
        height: 8,
      }}
    />
  </View>
);

export const Avatar: React.FC<{ name: string; size?: number }> = ({
  name,
  size = 36,
}) => {
  const int = (name || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hue = (hash(name) % 360 + 360) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue},70%,42%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800' }}>{int || '?'}</Text>
    </View>
  );
};

export const ListRow: React.FC<
  WithChildren<{
    left?: React.ReactNode;
    title: string;
    caption?: string;
    right?: React.ReactNode;
  }>
> = ({ left, title, caption, right }) => (
  <View style={styles.row}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {!!left && <View style={{ marginRight: 12 }}>{left}</View>}
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!caption && <Text style={styles.rowCaption}>{caption}</Text>}
      </View>
    </View>
    {!!right && right}
  </View>
);

export const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Text style={styles.section}>{label.toUpperCase()}</Text>
);

export const Money: React.FC<{ value: number; currency?: string; bold?: boolean }> =
  ({ value, currency = '$', bold }) => {
    const color = value >= 0 ? theme.colors.green : theme.colors.red;
    const sign = value >= 0 ? '+' : '-';
    return (
      <Text style={{ color, fontWeight: bold ? '900' : '800' }}>
        {`${sign}${currency}${Math.abs(value).toFixed(2)}`}
      </Text>
    );
  };

/* utils */
const hash = (s: string) =>
  [...s].reduce((a, c) => (((a << 5) - a) + c.charCodeAt(0)) | 0, 0);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  h2: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: theme.colors.subtext },
  label: { color: theme.colors.subtext, marginBottom: 6, fontSize: 12 },
  input: {
    backgroundColor: '#0F141A',
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', paddingHorizontal: 16, marginRight: 8 },
  btnText: { color: '#fff', fontWeight: '800' },
  row: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: { color: theme.colors.text, fontWeight: '700' },
  rowCaption: { color: theme.colors.subtext, fontSize: 12, marginTop: 2 },
  section: { color: '#9CA3AF', fontWeight: '800', letterSpacing: 1, marginTop: 10, marginBottom: 6 },
});
