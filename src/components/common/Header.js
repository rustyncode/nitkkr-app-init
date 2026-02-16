import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { spacing, typography } from "../../theme/spacing";

const LOGO = require("../../../assets/nitkkr-logo.png");

export default function Header() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Title block */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            NIT KKR
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Universal App
          </Text>
        </View>
      </View>

      {/* Bottom accent strip */}
      <View style={styles.accentStrip} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.primary,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    minHeight: spacing.headerHeight,
  },

  logoContainer: {
    width: spacing.logoMd + 4,
    height: spacing.logoMd + 4,
    borderRadius: (spacing.logoMd + 4) / 2,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },

  logo: {
    width: spacing.logoMd - 2,
    height: spacing.logoMd - 2,
  },

  textContainer: {
    flex: 1,
    marginLeft: spacing.md + 2,
    justifyContent: "center",
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.textInverse,
    letterSpacing: typography.letterSpacing.wide + 0.5,
  },

  subtitle: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.medium,
    color: colors.accentLight,
    marginTop: spacing.xxs + 1,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase",
    opacity: 0.95,
  },

  accentStrip: {
    height: 3,
    backgroundColor: colors.accent,
  },
});
