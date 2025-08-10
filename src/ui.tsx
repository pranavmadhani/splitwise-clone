// src/ui.tsx
import React, { PropsWithChildren, forwardRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, StyleProp,
  Image, SafeAreaView, TextInput, TextInputProps,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { palette, radius, spacing, type, shadow } from './theme';

// ---------- Base wrappers ----------
type BoxProps = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;
type TxtProps = PropsWithChildren<{ style?: StyleProp<TextStyle>; label?: string }>;

export const Screen = ({ children, style }: BoxProps) => (
  <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>
);

export const Row = ({ children, style }: BoxProps) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>
);

export const Card = ({ children, style }: BoxProps) => (
  <View style={[styles.card, shadow.card, style]}>{children}</View>
);

// ---------- Typography (accept children OR label prop) ----------
export const H1 = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.h1, style]}>{label ?? children}</Text>
);
export const H2 = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.h2, style]}>{label ?? children}</Text>
);
export const Label = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.label, style]}>{label ?? children}</Text>
);
export const Body = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.body, style]}>{label ?? children}</Text>
);
export const Dim = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.dim, style]}>{label ?? children}</Text>
);

// Aliases used by screens
export const Title = H2;
export const Subtitle = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.subtitle, style]}>{label ?? children}</Text>
);
export const SectionHeader = ({ children, label, style }: TxtProps) => (
  <Text style={[styles.sectionHeader, style]}>{label ?? children}</Text>
);

// ---------- Icons ----------
export const Icon = ({
  name, size = 18, color = palette.text, pack = 'ion',
}: { name: any; size?: number; color?: string; pack?: 'ion' | 'mci' }) =>
  pack === 'ion' ? <Ionicons name={name} size={size} color={color} />
                 : <MaterialCommunityIcons name={name} size={size} color={color} />;

export const IconButton = ({
  onPress, name, pack = 'ion',
}: { onPress?: () => void; name: any; pack?: 'ion' | 'mci' }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
    <Icon name={name} pack={pack} />
  </TouchableOpacity>
);

// ---------- Avatar (accepts name OR label OR uri) ----------
export const Avatar = ({
  uri, size = 36, label, name,
}: { uri?: string; size?: number; label?: string; name?: string }) =>
  uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: '#243141',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: palette.text, fontWeight: '700' }}>
        {(label || name || '?').slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );

// ---------- Pills / Segments / Progress ----------
export const Pill = ({
  active, children, style,
}: PropsWithChildren<{ active?: boolean; style?: StyleProp<ViewStyle> }>) => (
  <View
    style={[
      {
        paddingHorizontal: spacing[4], height: 36, borderRadius: radius.full,
        justifyContent: 'center',
        backgroundColor: active ? palette.pillOn : palette.pillBg,
        borderWidth: 1, borderColor: active ? palette.mint : palette.pillStroke,
      },
      style,
    ]}
  >
    <Text style={{ color: active ? palette.text : palette.textDim, fontWeight: '600' }}>{children}</Text>
  </View>
);

export const Tag = ({
  label, tone = 'neutral' as 'neutral' | 'pos' | 'neg', style,
}: { label?: string; tone?: 'neutral' | 'pos' | 'neg'; style?: StyleProp<TextStyle> }) => {
  const color = tone === 'pos' ? palette.pos : tone === 'neg' ? palette.neg : palette.textDim;
  return <Text style={[{ color, fontWeight: '700' }, style]}>{label}</Text>;
};

export const Segmented = ({
  value, onChange, options, style,
}: { value: string; options: string[]; onChange: (v: string) => void; style?: StyleProp<ViewStyle> }) => (
  <Row style={[{ backgroundColor: palette.pillBg, borderRadius: radius.full, padding: 4, gap: 6 }, style]}>
    {options.map((opt) => (
      <TouchableOpacity key={opt} onPress={() => onChange(opt)}>
        <Pill active={opt === value}>{opt}</Pill>
      </TouchableOpacity>
    ))}
  </Row>
);

export const Progress = ({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: 8, backgroundColor: '#0F1926', borderRadius: radius.full, overflow: 'hidden' }, style]}>
    <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: palette.mint, height: '100%' }} />
  </View>
);

// Money: accept amt OR value + bold flag (for legacy)
export const Amount = ({ amt, value, bold }: { amt?: number; value?: number; bold?: boolean }) => {
  const v = typeof amt === 'number' ? amt : (value ?? 0);
  return (
    <Text style={{ fontSize: 16, fontWeight: bold ? '800' as const : '700' as const, color: v >= 0 ? palette.pos : palette.neg }}>
      {v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(2)}
    </Text>
  );
};
// Legacy alias
export const Money = Amount;

// ---------- Buttons / Inputs ----------
export const PrimaryBtn = ({
  title, onPress, style, kind,
}: { title: string; onPress?: () => void; style?: StyleProp<ViewStyle>; kind?: 'primary' | 'secondary' | 'ghost' }) => {
  const isSecondary = kind === 'secondary';
  const isGhost = kind === 'ghost';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.primary,
        isSecondary && { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.mint },
        isGhost && { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.pillStroke },
        style,
      ]}
    >
      <Text style={{ color: isSecondary ? palette.mint : isGhost ? palette.text : '#071013', fontWeight: '800' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
// Legacy alias
export const Button = PrimaryBtn;

// Styled TextInput that supports optional `label` prop
export const Input = forwardRef<TextInput, TextInputProps & { label?: string }>(function Input(props, ref) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ width: '100%' }}>
      {label ? <Text style={{ color: palette.textDim, marginBottom: 6, fontWeight: '600' }}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={palette.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
});

// ---------- ListRow ----------
type ListRowProps = {
  style?: StyleProp<ViewStyle>;
  left?: React.ReactNode;
  title?: React.ReactNode;
  caption?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
};

export const ListRow: React.FC<ListRowProps> = ({ children, style, left, title, caption, right, onPress }) => {
  if (children) return <Row style={[styles.rowBase, style]}>{children}</Row>;
  const Content = (
    <>
      {left ? <View style={{ marginRight: spacing[3] }}>{left}</View> : null}
      <View style={{ flex: 1 }}>
        {typeof title === 'string' ? <Text style={{ color: palette.text, fontWeight: '700' }}>{title}</Text> : title}
        {caption
          ? (typeof caption === 'string'
              ? <Text style={{ color: palette.textDim, marginTop: 2 }}>{caption}</Text>
              : caption)
          : null}
      </View>
      {right ? <View style={{ marginLeft: spacing[3], alignItems: 'flex-end' }}>{right}</View> : null}
    </>
  );
  return onPress
    ? <TouchableOpacity onPress={onPress} style={[styles.rowBase, style]}>{Content}</TouchableOpacity>
    : <Row style={[styles.rowBase, style]}>{Content}</Row>;
};

// ---------- Header ----------
export const Header = ({ title }: { title: string }) => (
  <Row style={{ justifyContent: 'space-between', marginBottom: spacing[4] }}>
    <Row style={{ gap: spacing[3] }}>
      <MaterialCommunityIcons name="hexagon-slice-6" size={20} color={palette.mint} />
      <H2>{title}</H2>
    </Row>
    <Row style={{ gap: spacing[3] }}>
      <IconButton name="search-outline" />
      <IconButton pack="mci" name="bell-outline" />
    </Row>
  </Row>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    borderColor: palette.border,
    borderWidth: StyleSheet.hairlineWidth,
  },

  h1: { ...type.h1, color: palette.text },
  h2: { ...type.h2, color: palette.text },
  label: { ...type.label, color: palette.textDim },
  body: { ...type.body, color: palette.text },
  dim: { ...type.dim },

  subtitle: { fontSize: 14, color: palette.textDim, fontWeight: '600' },
  sectionHeader: { fontSize: 12, color: palette.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },

  iconBtn: {
    width: 36, height: 36, borderRadius: radius.full, backgroundColor: palette.pillBg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.pillStroke,
  },
  primary: {
    backgroundColor: palette.mint, height: 44, paddingHorizontal: spacing[6],
    borderRadius: radius.full, alignItems: 'center', justifyContent: 'center',
  },
  input: {
    backgroundColor: '#0F1520',
    borderColor: palette.pillStroke,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: 12,
    color: palette.text,
    fontSize: 16,
  },
  rowBase: { justifyContent: 'space-between', paddingVertical: spacing[3], alignItems: 'center' },
});

// Legacy export if something imports MoneyLegacy
export { Amount as MoneyLegacy };
