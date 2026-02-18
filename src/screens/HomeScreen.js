import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../theme/spacing";
import config from "../constants/config";
import apiClient from "../api/client";


const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Quick Actions (tappable grid) ─────────────────────────

const QUICK_ACTIONS = [
  {
    key: "PYQ",
    icon: "document-text",
    label: "PYQ Papers",
    subtitle: "1000+ papers",
    gradient: ["#6366F1", "#818CF8"],
    bg: "rgba(99, 102, 241, 0.10)",
    color: "#6366F1",
    route: "PYQ",
  },
  {
    key: "Attendance",
    icon: "calendar",
    label: "Attendance",
    subtitle: "Track records",
    gradient: ["#10B981", "#34D399"],
    bg: "rgba(16, 185, 129, 0.10)",
    color: "#10B981",
    route: "Attendance",
  },
  {
    key: "Jobs",
    icon: "briefcase",
    label: "Jobs",
    subtitle: "Latest openings",
    gradient: ["#F59E0B", "#FBBF24"],
    bg: "rgba(245, 158, 11, 0.10)",
    color: "#F59E0B",
    route: "Jobs",
  },

  {
    key: "Alerts",
    icon: "notifications",
    label: "Alerts",
    subtitle: "Live updates",
    gradient: ["#EF4444", "#F87171"],
    bg: "rgba(239, 68, 68, 0.10)",
    color: "#EF4444",
    route: "Alerts",
  },
];

// ─── Stats ──────────────────────────────────────────────────

const STATS = [
  {
    value: "10+",
    label: "Departments",
    icon: "school",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
  {
    value: "1000+",
    label: "Papers",
    icon: "document-text",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    value: "2015–25",
    label: "Years",
    icon: "calendar",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.10)",
  },
];

// ─── Features ───────────────────────────────────────────────

const FEATURES = [
  {
    icon: "search",
    title: "Smart Search",
    description:
      "Find papers by subject name, code, department — works offline",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    icon: "cloud-download",
    title: "Instant Download",
    description: "Download PDFs and open directly in your viewer app",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
  {
    icon: "notifications",
    title: "College Alerts",
    description: "Live notifications from NIT KKR website — never miss updates",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.10)",
  },
  {
    icon: "wifi",
    title: "Offline First",
    description:
      "Everything cached locally. Works without internet after first sync",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.10)",
  },
];

// ─── Coming Soon ────────────────────────────────────────────

const COMING_FEATURES = [
  {
    icon: "briefcase",
    title: "Placement Hub",
    tag: "Live",
    tagColor: "#10B981",
    tagBg: "rgba(16, 185, 129, 0.12)",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.10)",
  },
  {
    icon: "book",
    title: "Lecture Notes",
    tag: "Soon",
    tagColor: "#10B981",
    tagBg: "rgba(16, 185, 129, 0.12)",
    color: "#14B8A6",
    bg: "rgba(20, 184, 166, 0.10)",
  },
  {
    icon: "analytics",
    title: "Exam Analytics",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.10)",
  },
  {
    icon: "chatbubbles",
    title: "AI Assistant",
    tag: "Exploring",
    tagColor: "#F59E0B",
    tagBg: "rgba(245, 158, 11, 0.12)",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.10)",
  },
  {
    icon: "people",
    title: "Study Groups",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.10)",
  },
  {
    icon: "calendar",
    title: "Calendar",
    tag: "Planned",
    tagColor: "#3B82F6",
    tagBg: "rgba(59, 130, 246, 0.12)",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.10)",
  },
];

// ─── How to Use ─────────────────────────────────────────────

const STEPS = [
  {
    num: "1",
    title: "Browse PYQs",
    desc: "Go to PYQ tab and explore papers from all departments",
    icon: "reader-outline",
    color: "#6366F1",
  },
  {
    num: "2",
    title: "Search & Filter",
    desc: "Use smart search or filters to find exactly what you need",
    icon: "filter-outline",
    color: "#3B82F6",
  },
  {
    num: "3",
    title: "Download",
    desc: "Tap download to save PDF and open it directly",
    icon: "cloud-download-outline",
    color: "#10B981",
  },
  {
    num: "4",
    title: "Stay Updated",
    desc: "Check Alerts tab for latest NIT KKR notifications",
    icon: "notifications-outline",
    color: "#EF4444",
  },
];

// ─── Sub-components ─────────────────────────────────────────

function QuickActionCard({ item, onPress }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.textPrimary }]} numberOfLines={1}>
        {item.label}
      </Text>
      <Text style={[styles.quickSub, { color: colors.textTertiary }]} numberOfLines={1}>
        {item.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function StatChip({ item }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statChip, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
      <View style={[styles.statIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{item.value}</Text>
        <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{item.label}</Text>
      </View>
    </View>
  );
}

function FeatureRow({ item, isLast }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.featureRow, !isLast && [styles.featureRowBorder, { borderBottomColor: colors.borderLight }]]}>
      <View style={[styles.featureIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    </View>
  );
}

function ComingChip({ item }) {
  return (
    <View style={styles.comingChip}>
      <View style={[styles.comingIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <Text style={styles.comingTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={[styles.comingTag, { backgroundColor: item.tagBg }]}>
        <Text style={[styles.comingTagText, { color: item.tagColor }]}>
          {item.tag}
        </Text>
      </View>
    </View>
  );
}

function StepItem({ item, isLast }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepRow}>
      {/* Timeline */}
      <View style={styles.stepTimeline}>
        <View style={[styles.stepDot, { backgroundColor: item.color }]}>
          <Text style={[styles.stepNum, { color: colors.white }]}>{item.num}</Text>
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.borderLight }]} />}
      </View>
      {/* Content */}
      <View style={[styles.stepContent, isLast && { marginBottom: 0 }]}>
        <View style={styles.stepHeader}>
          <Ionicons name={item.icon} size={15} color={item.color} />
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        </View>
        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
      </View>
    </View>
  );
}

// ... (existing imports)

// ─── Greeting Logic ────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ icon, iconColor, iconBg, title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ... (existing constants)

// ─── Main Screen ────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Use dynamic theme colors
  const [stats, setStats] = useState({
    users: "10K+",
    downloads: "50K+",
    papers: "1200+",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiClient.fetchStatsCached();
        if (data) {
          setStats({
            users: data.totalUsers ? `${data.totalUsers}+` : "10K+",
            downloads: data.totalDownloads ? `${data.totalDownloads}+` : "50K+",
            papers: data.totalPapers ? `${data.totalPapers}+` : "1200+",
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);
  const greeting = getGreeting();

  const handleWebsitePress = () => {
    Linking.openURL("https://nitkkr.ac.in").catch(() => { });
  };

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {/* ─── Hero Section: Greeting + Dynamic Stats ─────────────────── */}
      <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <View style={styles.greetingArea}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greetingText}>{greeting},</Text>
                <Text style={styles.studentName}>Fellow NITian 👋</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Menu", { screen: "Alerts" })}
                style={styles.notifIconBtn}
              >
                <View style={styles.notifIconOuter}>
                  <Ionicons name="notifications-outline" size={24} color="#FFF" />
                  <View style={[styles.notifBadge, { backgroundColor: colors.accent }]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Action Call */}
          <View style={styles.heroStatsGrid}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.papers}</Text>
              <Text style={styles.heroStatLabel}>Papers</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.users}</Text>
              <Text style={styles.heroStatLabel}>Students</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.downloads}</Text>
              <Text style={styles.heroStatLabel}>Downloads</Text>
            </View>
          </View>
        </View>

        {/* Subtle background decoration */}
        <View style={styles.heroDecoration} />
      </View>

      {/* ─── Quick Navigation ───────────────────────────────── */}
      <View style={styles.navContainer}>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((item) => (
            <QuickActionCard
              key={item.key}
              item={item}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>
      </View>

      {/* ─── Key Features Showcase ─────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="sparkles"
          iconColor={colors.primary}
          iconBg={colors.primaryFaded}
          title="Campus Toolkit"
          subtitle="Essential tools for NIT KKR students"
        />
        <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {FEATURES.map((item, i) => (
            <FeatureRow
              key={i}
              item={item}
              isLast={i === FEATURES.length - 1}
            />
          ))}
        </View>
      </View>

      {/* ─── Getting Started ───────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="bulb-outline"
          iconColor={colors.accent}
          iconBg={colors.accentFaded}
          title="Quick Guide"
          subtitle="How to make the most of Hub"
        />
        <View style={[styles.stepsCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {STEPS.map((item, i) => (
            <StepItem key={i} item={item} isLast={i === STEPS.length - 1} />
          ))}
        </View>
      </View>

      {/* ─── Roadmap ────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="rocket-outline"
          iconColor={colors.secondary}
          iconBg={colors.secondaryFaded}
          title="The Roadmap"
          subtitle="Features in active development"
        />
        <View style={styles.comingGrid}>
          {COMING_FEATURES.map((item, i) => (
            <ComingChip key={i} item={item} />
          ))}
        </View>

        {/* Suggestion CTA */}
        <TouchableOpacity
          style={[styles.suggestCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={() => Linking.openURL("mailto:support@rustinet.com").catch(() => { })}
        >
          <View style={[styles.suggestIconWrap, { backgroundColor: colors.accentFaded }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.accent} />
          </View>
          <View style={styles.suggestText}>
            <Text style={[styles.suggestTitle, { color: colors.textPrimary }]}>Feedback & Ideas</Text>
            <Text style={[styles.suggestDesc, { color: colors.textSecondary }]}>
              Missing something? Let us know what to build next!
            </Text>
          </View>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Proudly built for NIT Kurukshetra
        </Text>
        <Text style={[styles.footerVersion, { color: colors.textTertiary }]}>
          Hub v{config.APP_VERSION} Stable
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const CARD_RADIUS = 18;
const CARD_SHADOW = {
  elevation: 3,
  shadowColor: "rgba(15, 23, 42, 0.08)",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 140,
  },

  // ─── Hero Section ──────────────────────────────────────────
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroContent: {
    zIndex: 2,
  },
  greetingArea: {
    marginBottom: 28,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  studentName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroStatsGrid: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroDecoration: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifIconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  notifIconOuter: {
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  // ─── Nav Container ────────────────────────────────────────
  navContainer: {
    paddingHorizontal: 16,
    marginTop: -20, // Overlap effect
    zIndex: 10,
  },

  // ─── Quick Actions Grid ────────────────────────────────────
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    borderRadius: CARD_RADIUS,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    ...CARD_SHADOW,
    borderWidth: 1,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  quickSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 3,
    textAlign: "center",
  },

  // ─── Sections ──────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    marginTop: 1,
  },

  // ─── Features Card ─────────────────────────────────────────
  featuresCard: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    ...CARD_SHADOW,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    opacity: 0.8,
  },

  // ─── Steps Card ────────────────────────────────────────────
  stepsCard: {
    borderRadius: CARD_RADIUS,
    padding: 20,
    borderWidth: 1,
    ...CARD_SHADOW,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepTimeline: {
    alignItems: "center",
    width: 32,
    marginRight: 16,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: "800",
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
    opacity: 0.7,
  },

  // ─── Coming Soon Grid ──────────────────────────────────────
  comingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  comingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    width: (SCREEN_WIDTH - 32 - 12) / 2,
  },
  comingIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  comingTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    color: "#334155",
  },
  comingTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  comingTagText: {
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  // ─── Suggest Card ──────────────────────────────────────────
  suggestCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...CARD_SHADOW,
  },
  suggestIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  suggestText: {
    flex: 1,
  },
  suggestTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  suggestDesc: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },

  // ─── Footer ─────────────────────────────────────────────
  footer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.8,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.5,
  },
});
