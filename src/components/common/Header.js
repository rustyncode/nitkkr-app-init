import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "../../theme/spacing";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";


export default function Header({ title: customTitle }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const state = useNavigationState(state => state);

  // Detect current screen name for the title efficiently
  const getActiveRouteName = (navState) => {
    if (!navState || !navState.routes) return null;
    const route = navState.routes[navState.index];
    if (!route) return null;

    if (route.state) {
      return getActiveRouteName(route.state);
    }
    return route.name;
  };

  const currentRouteName = customTitle || getActiveRouteName(state) || "";

  // ─── Back Button Detection ───────────────────────────────
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView
      style={[styles.wrapper, { backgroundColor: colors.primary }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {canGoBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.textInverse} />
          </TouchableOpacity>
        )}

        {/* Title block */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textInverse }]} numberOfLines={1}>
            {currentRouteName === "Menu" ? "More" : currentRouteName}
          </Text>
        </View>

        {/* Right Action: Alerts */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu", { screen: "Alerts" })}
          style={styles.rightButton}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={[styles.accentStrip, { backgroundColor: colors.accent }]} />
    </SafeAreaView>
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

  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },

  rightButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    marginRight: -spacing.xs,
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
