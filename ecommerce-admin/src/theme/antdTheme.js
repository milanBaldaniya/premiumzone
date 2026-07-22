import { theme } from 'antd';

// Shared luxury palette — identical tokens to the Next.js client.
export const COLORS = {
  primary: '#0F172A',
  secondary: '#111827',
  accent: '#D4AF37',
  accentDark: '#B8942A',
  surface: '#F8FAFC',
  ink: '#111827',
};

export const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: COLORS.primary,
    colorInfo: COLORS.accent,
    colorLink: COLORS.accentDark,
    colorBgLayout: COLORS.surface,
    borderRadius: 10,
    fontFamily: "'Inter', system-ui, sans-serif",
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: COLORS.primary,
      headerBg: '#ffffff',
      bodyBg: COLORS.surface,
    },
    Menu: {
      darkItemBg: COLORS.primary,
      darkItemSelectedBg: COLORS.accent,
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverColor: COLORS.accent,
    },
    Button: {
      primaryShadow: 'none',
      fontWeight: 600,
    },
    Card: { borderRadiusLG: 16 },
    Table: { headerBg: '#F1F5F9', headerColor: COLORS.primary },
  },
};
