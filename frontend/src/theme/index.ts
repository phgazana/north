export const colors = {
  navy: '#0B132B',
  orange: '#FF6B00',
  blue: '#1E3A8A',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray200: '#E5E7EB',
  gray100: '#F3F4F6',
  white: '#FFFFFF',
  successSoft: '#DCFCE7',
  errorSoft: '#FEE2E2',
  warningSoft: '#FEF3C7',
  infoSoft: '#E0E7FF',
  blueSoft: '#EFF6FF',
  canvas: '#F8FAFC',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40, huge: 48, giant: 64 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
export const typography = {
  display: { fontFamily: 'Inter-Bold', fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h1: { fontFamily: 'Inter-Bold', fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h2: { fontFamily: 'Inter-SemiBold', fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  body1: { fontFamily: 'Inter-Regular', fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  body2: { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  body2Medium: { fontFamily: 'Inter-Medium', fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
} as const;
export const shadow = { shadowColor: '#0B132B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 };
