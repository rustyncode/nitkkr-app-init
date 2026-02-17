import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../theme/spacing";
import config from "../constants/config";


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
      showsVerticalScrollIndicator={false}
    >
      {/* Quick Stats Bar - Replaces Hero */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>1000+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Papers</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={20} color={colors.accent} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>50K+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Students</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statItem}>
          <Ionicons name="flash-outline" size={20} color={colors.featureGreen} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>Fast</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Downloads</Text>
        </View>
      </View>

      {/* ─── Quick Actions Grid ───────────────────────────────── */}
      <View style={styles.section}>
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

      {/* ─── Stats ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.statsHeader, { borderBottomColor: colors.borderLight }]}>
            <Ionicons name="pulse" size={18} color={colors.primary} />
            <Text style={[styles.statsHeaderText, { color: colors.textPrimary }]}>At a Glance</Text>
          </View>
          <View style={styles.statsRow}>
            {STATS.map((item, i) => (
              <StatChip key={i} item={item} />
            ))}
          </View>
        </View>
      </View>

      {/* ─── Features ─────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="sparkles"
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.10)"
          title="What You Can Do"
          subtitle="Available right now"
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

      {/* ─── How to Use ───────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="map-outline"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.10)"
          title="Get Started"
          subtitle="4 simple steps"
        />
        <View style={[styles.stepsCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {STEPS.map((item, i) => (
            <StepItem key={i} item={item} isLast={i === STEPS.length - 1} />
          ))}
        </View>
      </View>

      {/* ─── Coming Soon ──────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon="rocket"
          iconColor="#F59E0B"
          iconBg="rgba(245, 158, 11, 0.10)"
          title="Coming Soon"
          subtitle="On the roadmap"
        />
        <View style={styles.comingGrid}>
          {COMING_FEATURES.map((item, i) => (
            <ComingChip key={i} item={item} />
          ))}
        </View>

        {/* Suggestion CTA */}
        <View style={styles.suggestCard}>
          <View style={styles.suggestIconWrap}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
          </View>
          <View style={styles.suggestText}>
            <Text style={[styles.suggestTitle, { color: colors.textPrimary }]}>Have an idea?</Text>
            <Text style={[styles.suggestDesc, { color: colors.textSecondary }]}>
              We're building this for you. Share your suggestions!
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textTertiary}
          />
        </View>
      </View>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Made with ❤️ for NIT Kurukshetra students
        </Text>
        <Text style={[styles.footerVersion, { color: colors.textTertiary }]}>
          {config.APP_NAME} v{config.APP_VERSION}
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
    // backgroundColor handled inline
  },
  contentContainer: {
    paddingBottom: 140, // room for floating tab bar
  },

  // ─── Stats Bar (Replaces Hero) ─────────────────────────────
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 40,
  },


  // ─── Sections ──────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    // color handled inline
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    // color handled inline
    marginTop: 1,
  },

  // ─── Quick Actions Grid ────────────────────────────────────
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    // backgroundColor handled inline
    borderRadius: CARD_RADIUS,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    // borderColor handled inline
    ...CARD_SHADOW,
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
    // color handled inline
    textAlign: "center",
  },
  quickSub: {
    fontSize: 11,
    fontWeight: "500",
    // color handled inline
    marginTop: 3,
    textAlign: "center",
  },

  // ─── Stats Card ────────────────────────────────────────────
  statsCard: {
    // backgroundColor handled inline
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    // borderColor handled inline
    ...CARD_SHADOW,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    // borderBottomColor handled inline
  },
  statsHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    // color handled inline
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statChip: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    // backgroundColor handled inline
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    // borderColor handled inline
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statTextWrap: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    // color handled inline
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    // color handled inline
    marginTop: 2,
    textAlign: "center",
  },

  // ─── Features Card ─────────────────────────────────────────
  featuresCard: {
    // backgroundColor handled inline
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    // borderColor handled inline
    ...CARD_SHADOW,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    // borderBottomColor handled inline
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    // color handled inline
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12.5,
    fontWeight: "400",
    // color handled inline
    lineHeight: 17,
  },

  // ─── Steps Card ────────────────────────────────────────────
  stepsCard: {
    // backgroundColor handled inline
    borderRadius: CARD_RADIUS,
    padding: 16,
    paddingTop: 18,
    borderWidth: 1,
    // borderColor handled inline
    ...CARD_SHADOW,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepTimeline: {
    alignItems: "center",
    width: 32,
    marginRight: 14,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "800",
    // color handled inline
  },
  stepLine: {
    width: 2,
    flex: 1,
    // backgroundColor handled inline
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    marginBottom: 18,
    paddingTop: 2,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    // color handled inline
  },
  stepDesc: {
    fontSize: 12.5,
    fontWeight: "400",
    // color handled inline
    lineHeight: 17,
    paddingLeft: 21,
  },

  // ─── Coming Soon Grid ─────────────────────────────────────
  comingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 32 - 24) / 3,
    // backgroundColor handled inline
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  comingChip: {
    width: (SCREEN_WIDTH - 32 - 20) / 3,
    // backgroundColor handled inline
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  comingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  comingTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    // color handled inline
    textAlign: "center",
    marginBottom: 6,
  },
  comingTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingTagText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ─── Suggest Card ──────────────────────────────────────────
  suggestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.06)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    gap: 12,
  },
  suggestIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestText: {
    flex: 1,
  },
  suggestTitle: {
    fontSize: 13,
    fontWeight: "700",
    // color handled inline
  },
  suggestDesc: {
    fontSize: 11.5,
    fontWeight: "400",
    // color handled inline
    marginTop: 2,
    lineHeight: 16,
  },

  // ─── About Card ────────────────────────────────────────────
  aboutCard: {
    // backgroundColor handled inline
    borderRadius: CARD_RADIUS,
    padding: 18,
    borderWidth: 1,
    // borderColor handled inline
    ...CARD_SHADOW,
  },
  aboutText: {
    fontSize: 13.5,
    fontWeight: "400",
    // color handled inline
    lineHeight: 20,
    marginBottom: 16,
  },
  websiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  websiteBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ─── Footer ────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    // color handled inline
    textAlign: "center",
  },
  footerVersion: {
    fontSize: 10.5,
    fontWeight: "400",
    // color handled inline
    marginTop: 4,
    opacity: 0.6,
  },
});
