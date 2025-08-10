// src/theme.ts
// Design tokens + legacy aliases expected by screens

export const palette = {
  bg: '#0E1116',
  card: '#151A22',
  cardElev: '#1A202A',
  border: '#222A35',

  text: '#E9EEF5',
  textDim: '#97A3B6',
  textMuted: '#6B7280',

  mint: '#00B386',
  mintSoft: '#0B8F78',
  danger: '#FF6B6B',
  orange: '#FF7A45',

  pos: '#24D176',
  neg: '#FE5D5D',

  pillBg: '#0F1520',
  pillOn: '#121A27',
  pillStroke: '#253041',
};

export const radius = {
  xs: 8, sm: 12, md: 16, lg: 20, xl: 28, full: 999,
};

export const spacing = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 10: 40, 12: 48, 14: 56, 16: 64,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const type = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.2 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: 0.2 },
  h3: { fontSize: 16, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.3 },
  body: { fontSize: 15, fontWeight: '500' as const },
  dim: { fontSize: 13, color: palette.textDim },
  tiny: { fontSize: 11, color: palette.textMuted },
};

// ---- Colors + legacy aliases used in screens ----
export type Colors = {
  background: string; card: string; border: string; text: string; primary: string; notification: string;
  // legacy aliases
  brand: string; bg: string; subtext: string; line: string;
};

export const colors: Colors = {
  background: palette.bg,
  card: palette.card,
  border: palette.border,
  text: palette.text,
  primary: palette.mint,
  notification: palette.orange,

  // legacy aliases expected by some files
  brand: palette.mint,
  bg: palette.bg,
  subtext: palette.textDim,
  line: palette.border,
};

// React Navigation theme (if used)
export const navTheme = { dark: true, colors };

// Bundle so files can `import { theme } from './theme'`
export const theme = { palette, radius, spacing, shadow, type, colors, navTheme };
