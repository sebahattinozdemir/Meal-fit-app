export const colors = {
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  secondary: '#6366F1',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  workout: '#F59E0B',
  workoutLight: '#FEF3C7',
  rest: '#8B5CF6',
  restLight: '#EDE9FE',
  success: '#22C55E',
  danger: '#EF4444',
  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const cardShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

export const typography = {
  h1: { fontFamily: fonts.extrabold, fontSize: 28, color: colors.text },
  h2: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  h3: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 22 },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textSecondary },
  caption: { fontFamily: fonts.medium, fontSize: 11, color: colors.textLight },
};
