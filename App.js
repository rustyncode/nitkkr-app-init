import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import PYQScreen from "./src/screens/PYQScreen";
import NotesScreen from "./src/screens/NotesScreen"; // Included but not used in Tab
import AttendanceScreen from "./src/screens/AttendanceScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import JobsScreen from "./src/screens/JobsScreen";
import Header from "./src/components/common/Header";
import SplashScreen from "./src/screens/SplashScreen";

import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import useNotificationTracker from "./src/hooks/useNotificationTracker";

const Tab = createBottomTabNavigator();

const getTabConfig = (colors) => ({
  Home: {
    focused: "home",
    unfocused: "home-outline",
    activeColor: colors.featureBlue,
    activeBg: colors.featureBlueBg,
  },
  PYQ: {
    focused: "document-text",
    unfocused: "document-text-outline",
    activeColor: colors.featurePurple,
    activeBg: colors.featurePurpleBg,
  },
  Jobs: {
    focused: "briefcase",
    unfocused: "briefcase-outline",
    activeColor: colors.featureOrange,
    activeBg: colors.featureOrangeBg,
  },
  // Replaced Notes with Attendance
  Attendance: {
    focused: "calendar",
    unfocused: "calendar-outline",
    activeColor: colors.featureTeal,
    activeBg: colors.featureTealBg,
  },
  Alerts: {
    focused: "notifications",
    unfocused: "notifications-outline",
    activeColor: colors.featureRed,
    activeBg: colors.featureRedBg,
  },
  Settings: {
    focused: "settings",
    unfocused: "settings-outline",
    activeColor: colors.primaryLight,
    activeBg: colors.primaryFaded,
  },
});

function TabIcon({ route, focused }) {
  const { colors } = useTheme();
  const TAB_CONFIG = getTabConfig(colors);

  const config = TAB_CONFIG[route.name] || TAB_CONFIG.Home;
  const iconName = focused ? config.focused : config.unfocused;
  const iconColor = focused ? config.activeColor : colors.tabBarInactive;

  return (
    <View
      style={[
        styles.tabIconWrapper,
        focused && [
          styles.tabIconWrapperActive,
          { backgroundColor: config.activeBg },
        ],
      ]}
    >
      <Ionicons name={iconName} size={focused ? 22 : 21} color={iconColor} />
    </View>
  );
}

function MainAppContent() {
  const { colors, isDark } = useTheme();

  // Since Splash Screen handles the initial check, we disable autoCheck here
  const { status, newCount } = useNotificationTracker({
    autoCheck: false,
  });

  useEffect(() => {
    if (status === "new_found" && newCount > 0) {
      console.log(
        `[App] 🔔 ${newCount} new notification(s) detected — local notification fired.`,
      );
    }
  }, [status, newCount]);

  const TAB_CONFIG = getTabConfig(colors);

  // Dynamic Navigation Theme
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.error,
    },
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.primaryDark }]}>
      <StatusBar
        style="light"
        backgroundColor={colors.primaryDark}
        translucent={false}
      />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]} edges={["top", "left", "right"]}>
        <Header />

        <View style={[styles.contentArea, { backgroundColor: colors.background }]}>
          <NavigationContainer theme={navigationTheme}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <TabIcon
                    route={route}
                    focused={focused}
                  />
                ),
                tabBarActiveTintColor: TAB_CONFIG[route.name]?.activeColor || colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarStyle: [
                  styles.tabBar,
                  {
                    backgroundColor: isDark ? colors.surface : "rgba(255, 255, 255, 0.97)",
                    borderColor: colors.borderLight,
                    shadowColor: colors.shadowDark
                  }
                ],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarHideOnKeyboard: true,
                animation: "shift",
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
              <Tab.Screen name="PYQ" component={PYQScreen} options={{ tabBarLabel: "PYQ" }} />
              <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: "Jobs" }} />
              {/* Notes removed from tab, replaced with Attendance */}
              <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarLabel: "Attendance" }} />
              <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ tabBarLabel: "Alerts" }} />
              <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "Settings" }} />
            </Tab.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  if (!isAppReady) {
    return <SplashScreen onFinish={() => setIsAppReady(true)} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const TAB_BAR_BOTTOM = Platform.OS === "ios" ? 28 : 20;
const TAB_BAR_HORIZONTAL = 16;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    bottom: TAB_BAR_BOTTOM,
    left: TAB_BAR_HORIZONTAL,
    right: TAB_BAR_HORIZONTAL,
    borderTopWidth: 0,
    borderRadius: 28,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 4,
    elevation: 24,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    borderWidth: 1,
  },
  tabBarLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 0,
  },
  tabBarItem: {
    paddingVertical: 4,
    gap: 2,
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 32,
    borderRadius: 16,
  },
  tabIconWrapperActive: {
    width: 46,
    height: 34,
    borderRadius: 17,
  },
});
