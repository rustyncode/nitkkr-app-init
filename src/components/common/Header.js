import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { spacing, typography } from "../../theme/spacing";
import { useTheme } from "../../context/ThemeContext";



export default function Header() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.primary }]}>
      <View style={styles.container}>
        {/* Title block - Centered/Left aligned without logo */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textInverse }]} numberOfLines={1}>
            RustiNet
          </Text>
          <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.8)" }]} numberOfLines={1}>
            Student Hub for NIT KKR
          </Text>
        </View>
      </View>

      {/* Bottom accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: colors.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // backgroundColor handled inline
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    minHeight: spacing.headerHeight,
  },

  // Logo styles removed

  textContainer: {
    flex: 1,
    marginLeft: spacing.sm, // Reduced margin since no logo
    justifyContent: "center",
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extrabold,
    // color handled inline
    letterSpacing: typography.letterSpacing.wide + 0.5,
  },

  subtitle: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.medium,
    // color handled inline
    marginTop: spacing.xxs + 1,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase",
    opacity: 0.95,
  },

  accentStrip: {
    height: 3,
    // backgroundColor handled inline
  },
});
