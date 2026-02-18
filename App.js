import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Platform, LogBox } from "react-native";

// Suppress expected warnings in Expo Go
LogBox.ignoreLogs([
  "expo-notifications",
  "Encountered two children with the same key",
]);
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import PYQScreen from "./src/screens/PYQScreen";
import NotesScreen from "./src/screens/NotesScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import JobsScreen from "./src/screens/JobsScreen";
import BookmarksScreen from "./src/screens/BookmarksScreen";
import MenuScreen from "./src/screens/MenuScreen";
import AboutScreen from "./src/screens/AboutScreen";
import Header from "./src/components/common/Header";
import SplashScreen from "./src/screens/SplashScreen";

import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import useNotificationTracker from "./src/hooks/useNotificationTracker";
import * as ExpoSplashScreen from "expo-splash-screen";

// Prevent native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
  Attendance: {
    focused: "calendar",
    unfocused: "calendar-outline",
    activeColor: colors.featureTeal,
    activeBg: colors.featureTealBg,
  },
  Menu: {
    focused: "grid",
    unfocused: "grid-outline",
    activeColor: colors.primary,
    activeBg: colors.primary + "15",
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

// ─── Menu Stack ──────────────────────────────────────────────

function MenuStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="MenuHome" component={MenuScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Alerts" component={NotificationsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

function MainAppContent() {
  const { colors, isDark } = useTheme();

  const { status, newCount } = useNotificationTracker({
    autoCheck: false,
  });

  useEffect(() => {
    if (status === "new_found" && newCount > 0) {
      console.log(`[App] 🔔 ${newCount} new notification(s) detected.`);
    }
  }, [status, newCount]);

  const TAB_CONFIG = getTabConfig(colors);

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
    <NavigationContainer theme={navigationTheme}>
      <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={colors.primary}
          translucent={true}
        />

        <View style={styles.safeArea}>
          <View style={[styles.contentArea, { backgroundColor: colors.background }]}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: route.name !== "Home",
                header: () => <Header />,
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
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
              <Tab.Screen name="PYQ" component={PYQScreen} options={{ tabBarLabel: "PYQ" }} />
              <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: "Jobs" }} />
              <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarLabel: "Attendance" }} />
              <Tab.Screen
                name="Menu"
                component={MenuStack}
                options={{ tabBarLabel: "More" }}
                listeners={({ navigation }) => ({
                  tabPress: (e) => {
                    // Prevent default action
                    e.preventDefault();
                    // Reset the stack to the first screen and jump to it
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: "Menu", state: { routes: [{ name: "MenuHome" }] } }],
                      })
                    );
                  },
                })}
              />
            </Tab.Navigator>
          </View>
        </View>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  if (!isAppReady) {
    return (
      <SplashScreen
        onFinish={() => setIsAppReady(true)}
        onReady={() => ExpoSplashScreen.hideAsync().catch(() => { })}
      />
    );
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
