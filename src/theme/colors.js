// ─── NIT KKR App Color Palette ──────────────────────────────
// Modern, vibrant palette inspired by NIT Kurukshetra branding
// Deep indigo + warm amber/gold + clean neutrals

// Light Theme (Original)
const lightColors = {
  // Primary brand — rich indigo
  primary: "#2C3E9B",
  primaryLight: "#4A5BC7",
  primaryDark: "#141D52",
  primaryFaded: "rgba(44, 62, 155, 0.08)",
  primarySoft: "rgba(44, 62, 155, 0.14)",

  // Accent — warm amber/gold
  accent: "#F59E0B",
  accentLight: "#FBBF24",
  accentDark: "#D97706",
  accentFaded: "rgba(245, 158, 11, 0.12)",
  accentSoft: "rgba(245, 158, 11, 0.20)",

  // Secondary — teal for variety
  secondary: "#0D9488",
  secondaryLight: "#14B8A6",
  secondaryDark: "#0F766E",
  secondaryFaded: "rgba(13, 148, 136, 0.10)",

  // Semantic
  success: "#16A34A",
  successLight: "#DCFCE7",
  successDark: "#15803D",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  errorDark: "#B91C1C",
  warning: "#EA580C",
  warningLight: "#FFF7ED",
  warningDark: "#C2410C",
  info: "#0284C7",
  infoLight: "#E0F2FE",
  infoDark: "#0369A1",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  surfaceElevated: "#FFFFFF",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  textAccent: "#2C3E9B",
  textMuted: "#64748B",

  // Borders & dividers
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  borderMedium: "#CBD5E1",
  divider: "#E2E8F0",

  // Shadows
  shadow: "rgba(15, 23, 42, 0.06)",
  shadowMedium: "rgba(15, 23, 42, 0.10)",
  shadowDark: "rgba(15, 23, 42, 0.18)",

  // Chips / Tags
  chipEnd: "#EEF2FF",
  chipEndText: "#3730A3",
  chipMid: "#FFFBEB",
  chipMidText: "#B45309",
  chipMid1: "#E0F2FE",
  chipMid1Text: "#0369A1",
  chipMid2: "#FAE8FF",
  chipMid2Text: "#7E22CE",

  // Category badge colors
  categoryPC: "#DBEAFE",
  categoryPCText: "#1D4ED8",
  categoryIR: "#FFEDD5",
  categoryIRText: "#C2410C",
  categoryPE: "#F3E8FF",
  categoryPEText: "#7E22CE",
  categoryOE: "#DCFCE7",
  categoryOEText: "#16A34A",
  categoryTC: "#F1F5F9",
  categoryTCText: "#475569",

  // Gradient-like pairs (for cards, headers)
  gradientStart: "#2C3E9B",
  gradientEnd: "#4A5BC7",
  gradientAccentStart: "#F59E0B",
  gradientAccentEnd: "#FBBF24",

  // Skeleton / Loading
  skeleton: "#E2E8F0",
  skeletonHighlight: "#F1F5F9",

  // Overlay
  overlay: "rgba(15, 23, 42, 0.50)",
  overlayLight: "rgba(15, 23, 42, 0.25)",

  // Tab bar specific
  tabBarBg: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  tabBarActive: "#2C3E9B",
  tabBarInactive: "#94A3B8",

  // Card variants
  cardHighlight: "#EEF2FF",
  cardHighlightBorder: "#C7D2FE",
  cardWarm: "#FFFBEB",
  cardWarmBorder: "#FDE68A",
  cardCool: "#ECFDF5",
  cardCoolBorder: "#A7F3D0",

  // Feature section colors
  featureBlue: "#3B82F6",
  featureBlueBg: "#EFF6FF",
  featureGreen: "#10B981",
  featureGreenBg: "#ECFDF5",
  featureOrange: "#F97316",
  featureOrangeBg: "#FFF7ED",
  featurePurple: "#8B5CF6",
  featurePurpleBg: "#F5F3FF",
  featureRed: "#EF4444",
  featureRedBg: "#FEF2F2",
  featureTeal: "#14B8A6",
  featureTealBg: "#F0FDFA",
};

// Dark Theme
const darkColors = {
  // Primary brand — rich indigo (slightly lighter effectively in dark mode)
  primary: "#4E66E0",
  primaryLight: "#6B7DFF",
  primaryDark: "#1E2A78",
  primaryFaded: "rgba(78, 102, 224, 0.15)",
  primarySoft: "rgba(78, 102, 224, 0.25)",

  // Accent — warm amber/gold
  accent: "#FBBF24",
  accentLight: "#FCD34D",
  accentDark: "#B45309",
  accentFaded: "rgba(251, 191, 36, 0.15)",
  accentSoft: "rgba(251, 191, 36, 0.25)",

  // Secondary — teal
  secondary: "#14B8A6",
  secondaryLight: "#2DD4BF",
  secondaryDark: "#0F766E",
  secondaryFaded: "rgba(20, 184, 166, 0.15)",

  // Semantic
  success: "#22C55E",
  successLight: "rgba(34, 197, 94, 0.2)",
  successDark: "#15803D",
  error: "#EF4444",
  errorLight: "rgba(239, 68, 68, 0.2)",
  errorDark: "#991B1B",
  warning: "#F97316",
  warningLight: "rgba(249, 115, 22, 0.2)",
  warningDark: "#C2410C",
  info: "#38BDF8",
  infoLight: "rgba(56, 189, 248, 0.2)",
  infoDark: "#075985",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  background: "#020617", // Deeper slate/black
  surface: "#0F172A",    // Slate 900
  surfaceAlt: "#334155", // Even lighter
  surfaceElevated: "#334155",

  // Text
  textPrimary: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textTertiary: "#94A3B8",
  textInverse: "#0F172A",
  textAccent: "#818CF8",
  textMuted: "#64748B",

  // Borders & dividers
  border: "#334155",
  borderLight: "#1E293B",
  borderMedium: "#475569",
  divider: "#334155",

  // Shadows (less visible in dark mode, usually handled by elevation/lighter bg)
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowMedium: "rgba(0, 0, 0, 0.5)",
  shadowDark: "rgba(0, 0, 0, 0.7)",

  // Chips / Tags
  chipEnd: "#1E1B4B",
  chipEndText: "#A5B4FC",
  chipMid: "#451A03",
  chipMidText: "#FDBA74",
  chipMid1: "#0C4A6E",
  chipMid1Text: "#7DD3FC",
  chipMid2: "#581C87",
  chipMid2Text: "#D8B4FE",

  // Category badges
  categoryPC: "rgba(59, 130, 246, 0.2)",
  categoryPCText: "#93C5FD",
  categoryIR: "rgba(249, 115, 22, 0.2)",
  categoryIRText: "#FDBA74",
  categoryPE: "rgba(139, 92, 246, 0.2)",
  categoryPEText: "#C4B5FD",
  categoryOE: "rgba(34, 197, 94, 0.2)",
  categoryOEText: "#86EFAC",
  categoryTC: "rgba(100, 116, 139, 0.2)",
  categoryTCText: "#CBD5E1",

  // Gradient
  gradientStart: "#1E293B",
  gradientEnd: "#0F172A",
  gradientAccentStart: "#B45309",
  gradientAccentEnd: "#F59E0B",

  // Skeleton
  skeleton: "#334155",
  skeletonHighlight: "#475569",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.5)",

  // Tab bar
  tabBarBg: "#1E293B",
  tabBarBorder: "#334155",
  tabBarActive: "#818CF8",
  tabBarInactive: "#64748B",

  // Card variants
  cardHighlight: "rgba(59, 130, 246, 0.1)",
  cardHighlightBorder: "#1E40AF",
  cardWarm: "rgba(245, 158, 11, 0.1)",
  cardWarmBorder: "#92400E",
  cardCool: "rgba(16, 185, 129, 0.1)",
  cardCoolBorder: "#065F46",

  // Feature section
  featureBlue: "#60A5FA",
  featureBlueBg: "rgba(37, 99, 235, 0.1)",
  featureGreen: "#34D399",
  featureGreenBg: "rgba(5, 150, 105, 0.1)",
  featureOrange: "#FB923C",
  featureOrangeBg: "rgba(234, 88, 12, 0.1)",
  featurePurple: "#A78BFA",
  featurePurpleBg: "rgba(124, 58, 237, 0.1)",
  featureRed: "#F87171",
  featureRedBg: "rgba(220, 38, 38, 0.1)",
  featureTeal: "#2DD4BF",
  featureTealBg: "rgba(13, 148, 136, 0.1)",
};

export { lightColors, darkColors };
export default lightColors;
