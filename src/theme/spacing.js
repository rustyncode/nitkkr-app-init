// ─── NIT KKR PYQ App Spacing & Typography ────────────────────

const spacing = {
  // Base spacing scale (4px grid)
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 64,

  // Screen padding
  screenHorizontal: 16,
  screenVertical: 16,
  screenTop: 12,
  screenBottom: 24,

  // Card
  cardPadding: 16,
  cardMargin: 10,
  cardRadius: 14,
  cardRadiusSm: 10,

  // Chip / Tag
  chipPaddingH: 12,
  chipPaddingV: 6,
  chipRadius: 20,
  chipGap: 8,

  // Button
  buttonPaddingH: 20,
  buttonPaddingV: 12,
  buttonRadius: 12,
  buttonRadiusSm: 8,

  // Input
  inputHeight: 48,
  inputPaddingH: 16,
  inputRadius: 12,

  // Header
  headerHeight: 56,

  // Bottom sheet / modal
  modalRadius: 20,
  modalPadding: 20,

  // Divider
  dividerThickness: 1,

  // Icon sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 28,
  iconXxl: 36,

  // Avatar / Logo
  logoSm: 32,
  logoMd: 44,
  logoLg: 64,
  logoXl: 80,
};

const typography = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 34,
  },

  // Font weights
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export { spacing, typography };
export default spacing;
